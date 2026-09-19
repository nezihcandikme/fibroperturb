#!/usr/bin/env python3
"""Local-only exploratory paired guide-capture/RNA pilot from a 10x CSC H5 file.

NOT differential expression, verified perturbation assignment, or causal effects.
Never upload the input HDF5, barcodes, or per-cell vectors to the website.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from collections import defaultdict
import h5py
import numpy as np


def names(raw):
    return [x.decode('utf-8') if isinstance(x, bytes) else str(x) for x in raw]


def inspect(h5: h5py.File):
    m = h5['matrix']
    features = m['features']
    feature_types = np.asarray(names(features['feature_type'][:]))
    gene_idx = np.flatnonzero(feature_types == 'Gene Expression')
    guide_idx = np.flatnonzero(feature_types == 'CRISPR Guide Capture')
    if gene_idx.size == 0 or guide_idx.size == 0:
        raise ValueError('Expected Gene Expression and CRISPR Guide Capture features')
    if 'name' not in features:
        raise ValueError('Expected matrix/features/name for guide targets')
    gene_names = np.asarray(names(features['name'][gene_idx]))
    guide_targets = np.asarray(names(features['name'][guide_idx]))
    if len(m['indptr']) != int(m['shape'][1])+1:
        raise ValueError('Expected cell-column CSC indptr; unrecognized matrix format')
    return m, gene_idx, guide_idx, gene_names, guide_targets


def sample_pilot(path: Path, targets: tuple[str,...], scanned: int, max_group: int,
                 minimum_guide_count: int, dominance: float, minimum_rna: int):
    """Bounded memory: retain only aggregated gene vectors for chosen targets and controls.

    Sequential-prefix sampling may be batch-biased; output is explicitly exploratory.
    """
    with h5py.File(path, 'r') as h5:
        m, gene_idx, guide_idx, gene_names, guide_targets = inspect(h5)
        full_names = np.asarray(names(m['features']['name'][:]))
        group_by_feature = np.full(len(full_names), -1, dtype=np.int32)
        groups = ('non_targeting',) + tuple(t for t in targets if t != 'non_targeting')
        for k, target in enumerate(groups):
            group_by_feature[guide_idx[guide_targets == target]] = k
        guide_flag = np.zeros(len(full_names), dtype=bool)
        guide_flag[guide_idx] = True
        gene_flag = np.zeros(len(full_names), dtype=bool)
        gene_flag[gene_idx] = True
        gene_position = np.full(len(full_names), -1, dtype=np.int32)
        gene_position[gene_idx] = np.arange(len(gene_idx))
        gene_counts = np.zeros((len(groups),len(gene_idx)), dtype=np.float64)
        library_sums = np.zeros(len(groups), dtype=np.float64)
        cell_counts = np.zeros(len(groups), dtype=np.int64)
        guide_counts = defaultdict(set)
        indptr=m['indptr']
        for cell in range(min(scanned,int(m['shape'][1]))):
            start, stop = int(indptr[cell]),int(indptr[cell+1])
            if start == stop: continue
            idx = m['indices'][start:stop]
            val = m['data'][start:stop]
            g = guide_flag[idx]
            if not g.any(): continue
            captured = val[g]
            winner = int(np.argmax(captured))
            top_feature = int(idx[g][winner])
            top_count = int(captured[winner])
            if top_count < minimum_guide_count or top_count / max(1,int(captured.sum())) < dominance: continue
            group = int(group_by_feature[top_feature])
            if group < 0 or cell_counts[group] >= max_group: continue
            rna = gene_flag[idx]
            lib = int(val[rna].sum())
            if lib < minimum_rna: continue
            gene_counts[group,gene_position[idx[rna]]] += val[rna]
            library_sums[group] += lib
            cell_counts[group] += 1
            guide_counts[group].add(top_feature)
            if (cell_counts >= max_group).all(): break
        summaries = []
        control = gene_counts[0] / max(1,library_sums[0]) * 1e6
        for group, target in enumerate(groups):
            cpm = gene_counts[group] / max(1,library_sums[group]) * 1e6
            summaries.append({'target':target,'candidate_cells':int(cell_counts[group]),
                'distinct_top_guides':len(guide_counts[group]),
                'rna_library_counts':int(library_sums[group]),
                'top_rna_genes':[{'gene':str(gene_names[i]),'cpm':round(float(cpm[i]),2)}
                    for i in np.argsort(-cpm)[:10]],
                'exploratory_log2_cpm_ratio_vs_non_targeting':None if group == 0 or cell_counts[0] == 0 else
                [{'gene':str(gene_names[i]),'log2_ratio':round(float(np.log2((cpm[i]+1)/(control[i]+1))),3)}
                    for i in np.argsort(-np.abs(np.log2((cpm+1)/(control+1))))[:10]]})
        return {'analysis':'UNVALIDATED pilot: aggregate RNA count comparison among guide-capture candidates',
            'validated_assignments':False,'differential_expression':False,
            'biological_replicates_known':False,'sequential_prefix_sampling':True,
            'source':str(path.name),'scanned_cell_limit':scanned,'max_cells_per_group':max_group,
            'guide_count_cutoff':minimum_guide_count,'dominance_cutoff':dominance,
            'min_rna_counts':minimum_rna,'groups':summaries,
            'warning':'For local QC only. Not publishable differential expression, causal perturbation effects, or prediction. Check experimental guide calls, batches, controls, cell quality and biological replication before interpreting.'}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--h5',type=Path,default=Path('data/raw/hs27_filtered_feature_bc_matrix.h5'))
    p.add_argument('--targets',nargs='+',default=['SMAD3','AATF','ELK3','FOXL2'])
    p.add_argument('--scan',type=int,default=30000)
    p.add_argument('--max-per-group',type=int,default=40)
    p.add_argument('--minimum-guide-count',type=int,default=10)
    p.add_argument('--dominance',type=float,default=.8)
    p.add_argument('--min-rna-counts',type=int,default=200)
    p.add_argument('--output',type=Path,default=Path('results/pilot_expression_qc.json'))
    a=p.parse_args()
    if a.scan<1 or a.max_per_group<1 or a.minimum_guide_count<1 or not 0<a.dominance<=1 or a.min_rna_counts<0:
        p.error('Invalid limits or cutoffs')
    if not a.h5.is_file():p.error(f'Input HDF5 not found: {a.h5}')
    output=sample_pilot(a.h5,tuple(dict.fromkeys(a.targets)),a.scan,a.max_per_group,
                        a.minimum_guide_count,a.dominance,a.min_rna_counts)
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(output,indent=2,ensure_ascii=False)+'\n')
    print(f"Local unvalidated QC written: {a.output} | " + ', '.join(f"{g['target']}: {g['candidate_cells']}" for g in output['groups']))
    print('Do NOT upload results to the website or interpret as causal effects.')


if __name__=='__main__':main()
