#!/usr/bin/env python3
"""Aggregate-only metadata inspection of local Hs27 10x HDF5.

This checks schema and library coverage; it does NOT validate cell perturbations,
CRISPRa efficacy, matched controls, batches, or differential expression.
No barcodes, guide sequences/IDs or per-cell data are written to the report.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path

import h5py
import numpy as np


def _strings(values):
    return [v.decode('utf-8') if isinstance(v, bytes) else str(v) for v in values]


def inspect_assay(path: Path, *, preview_limit: int = 12) -> dict:
    """Inspect feature metadata without reading sparse per-cell count vectors."""
    if preview_limit < 0:
        raise ValueError('preview_limit must be nonnegative')
    with h5py.File(path, 'r') as h5:
        if 'matrix' not in h5:
            raise ValueError('Missing 10x matrix group')
        m = h5['matrix']
        if 'features' not in m or 'shape' not in m or 'indptr' not in m:
            raise ValueError('Incomplete 10x CSC matrix metadata')
        f = m['features']
        if 'feature_type' not in f or 'name' not in f:
            raise ValueError('Missing features/feature_type or features/name')
        shape = m['shape'][:]
        if len(shape) != 2 or int(shape[0]) < 1 or int(shape[1]) < 1:
            raise ValueError('Invalid 10x matrix shape')
        n_features, n_cells = map(int, shape)
        if len(m['indptr']) != n_cells + 1:
            raise ValueError('Unexpected CSC indptr length')
        kinds = np.asarray(_strings(f['feature_type'][:]))
        names = np.asarray(_strings(f['name'][:]))
        if len(kinds) != n_features or len(names) != n_features:
            raise ValueError('Feature metadata does not match matrix shape')
        if 'CRISPR Guide Capture' not in kinds:
            raise ValueError('Missing CRISPR Guide Capture features')
        if 'Gene Expression' not in kinds:
            raise ValueError('Missing Gene Expression features')
        guide_targets = Counter(names[kinds == 'CRISPR Guide Capture'].tolist())
        nt = sum(n for label, n in guide_targets.items() if label.lower() == 'non_targeting')
        return {
            'report_type': 'aggregate_feature_metadata_preflight',
            'source_filename': path.name,
            'cell_count': n_cells,
            'feature_count': n_features,
            'gene_expression_features': int(np.count_nonzero(kinds == 'Gene Expression')),
            'guide_feature_count': int(np.count_nonzero(kinds == 'CRISPR Guide Capture')),
            'unique_guide_targets': len(guide_targets),
            'non_targeting_features': nt,
            'target_preview': [
                {'target': label, 'guide_features': count}
                for label, count in sorted(guide_targets.items(), key=lambda pair: (-pair[1], pair[0]))[:preview_limit]
            ],
            'validated_perturbation_labels': False,
            'validated_controls': False,
            'expression_effects_computed': False,
            'needs_metadata': [
                'experimental guide assignments and thresholds',
                'batch and biological replicate annotations',
                'verified non-targeting/control library design',
                'guide multiplet/ambient capture assessment',
            ],
            'warning': 'Feature metadata is not experimental validation. Do not interpret captured guide dominance as verified CRISPRa activation.',
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--h5', type=Path, default=Path('data/raw/hs27_filtered_feature_bc_matrix.h5'))
    parser.add_argument('--output', type=Path, default=Path('results/assay_preflight.json'))
    args = parser.parse_args()
    if not args.h5.is_file():
        parser.error(f'Missing local HDF5: {args.h5}')
    report = inspect_assay(args.h5)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f"Preflight saved locally: {args.output} | {report['cell_count']:,} cells | {report['guide_feature_count']:,} guide features")
    print('No barcodes or per-cell counts exported; experimental metadata still required.')


if __name__ == '__main__':
    main()
