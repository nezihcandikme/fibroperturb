"""Export a bounded, aggregate explorer view of IGVF-published guide result tables.

No cell-level measurements, sequences, barcodes, or raw guide matrix are exported.
The precise score units/normalization are NOT inferred from column names alone.
"""
import argparse
import csv
import gzip
import json
import math
from collections import defaultdict
from pathlib import Path

MATRIX_FILE = 'IGVFFI6892KBHM.tsv.gz'
STATS_FILE = 'IGVFFI2104BKIF.tsv.gz'
DEFAULT_OUT = 'frontend/public/demo-data/published-results.json'


def number(text):
    try:
        result = float(text)
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def read_statistics(path):
    stats = defaultdict(list)
    with gzip.open(path, 'rt', newline='') as stream:
        reader = csv.DictReader(stream, delimiter='\t')
        required = {'guide_id', 'effect_score', 'p_val', 'p_val_adj', 'target_gene', 'intended_target_name'}
        if not reader.fieldnames or not required.issubset(reader.fieldnames):
            raise ValueError(f'Statistics file missing fields: {sorted(required-set(reader.fieldnames or []))}')
        for row in reader:
            guide = row['guide_id'].strip()
            if not guide:
                continue
            stats[guide].append({
                'effect_score': number(row['effect_score']),
                'p_value': number(row['p_val']),
                'adjusted_p_value': number(row['p_val_adj']),
                'measured_target_gene_id': row['target_gene'],
                'intended_target_gene_id': row['intended_target_name'],
            })
    # Each guide can have multiple promoter-level tests (one per target feature).
    # Keep a bounded preview without discarding the number of reported tests.
    for guide in stats:
        stats[guide].sort(key=lambda record: (
            record['adjusted_p_value'] is None,
            record['adjusted_p_value'] if record['adjusted_p_value'] is not None else float('inf'),
            record['measured_target_gene_id'],
        ))
    return stats


def build_export(matrix_path, stats_path, *, top_n=20):
    if not 1 <= top_n <= 100:
        raise ValueError('top_n must be between 1 and 100')
    stats = read_statistics(stats_path)
    targets = defaultdict(list)
    seen = set()
    gene_count = None
    with gzip.open(matrix_path, 'rt', newline='') as stream:
        reader = csv.reader(stream, delimiter='\t')
        header = next(reader, [])
        if not header or header[0] != 'guide_identity' or len(header) < 2:
            raise ValueError('Matrix missing guide_identity and gene columns')
        genes = header[1:]
        if any(not gene for gene in genes) or len(set(genes)) != len(genes):
            raise ValueError('Matrix has empty or duplicate gene column names')
        gene_count = len(genes)
        for row_no, row in enumerate(reader, 2):
            if len(row) != len(header):
                raise ValueError(f'Unexpected field count at matrix row {row_no}')
            guide = row[0].strip()
            if not guide or '_' not in guide:
                raise ValueError(f'Unrecognized guide_identity at matrix row {row_no}')
            if guide in seen:
                raise ValueError(f'Duplicate matrix guide: {guide}')
            seen.add(guide)
            target = guide.split('_', 1)[0]
            scored = [(gene, value) for gene, raw in zip(genes, row[1:]) if (value := number(raw)) is not None]
            # The sign, magnitude and units of the published matrix values remain unverified.
            scored.sort(key=lambda item: (-abs(item[1]), item[0]))
            targets[target].append({
                'guide_id': guide,
                'measured_gene_count': len(scored),
                'top_genes': [[gene, value] for gene, value in scored[:top_n]],
                'promoter_statistics_count': len(stats.get(guide, [])),
                'promoter_statistics': stats.get(guide, [])[:10],
            })
    for guides in targets.values():
        guides.sort(key=lambda item: item['guide_id'])
    return {
        'schema_version': 2,
        'source_analysis_set': 'IGVFDS2001NDKP',
        'matrix_file_id': 'IGVFFI6892KBHM',
        'promoter_statistics_file_id': 'IGVFFI2104BKIF',
        'matrix_value_description': 'Published guide-by-gene numerical value; exact scale and sign interpretation not independently verified',
        'expression_effects_validated': False,
        'guide_count': len(seen),
        'measured_gene_columns': gene_count,
        'statistical_guide_count': sum(guide in stats for guide in seen),
        'statistical_test_count': sum(len(stats[guide]) for guide in seen if guide in stats),
        'promoter_statistics_preview_limit': 10,
        'unmatched_statistical_guides': len(set(stats)-seen),
        'top_n_by_absolute_value': top_n,
        'targets': dict(sorted(targets.items())),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--matrix', type=Path, default=Path('data/raw')/MATRIX_FILE)
    parser.add_argument('--statistics', type=Path, default=Path('data/raw')/STATS_FILE)
    parser.add_argument('--output', type=Path, default=Path(DEFAULT_OUT))
    parser.add_argument('--top-n', type=int, default=20)
    args = parser.parse_args()
    if not args.matrix.exists() or not args.statistics.exists():
        parser.error('Missing downloaded IGVF files in data/raw; no synthetic data will be substituted.')
    result = build_export(args.matrix, args.statistics, top_n=args.top_n)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, allow_nan=False, separators=(',', ':')), encoding='utf-8')
    print(f'Exported {result["guide_count"]} guide rows across {len(result["targets"])} targets, {result["statistical_guide_count"]} with promoter statistics ({result["statistical_test_count"]} tests) to {args.output}')
    if result['unmatched_statistical_guides']:
        print(f'WARNING: {result["unmatched_statistical_guides"]} statistical guides missing from matrix')
    print('Published score interpretation not independently verified; no cell-level data exported.')


if __name__ == '__main__':
    main()
