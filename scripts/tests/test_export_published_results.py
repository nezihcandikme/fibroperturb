"""Synthetic contract checks for published IGVF table importer."""
import csv
import gzip
import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from export_published_results import build_export


class PublishedResultsTests(unittest.TestCase):
    def test_join_and_top_output_preserve_published_values(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            matrix = root / 'matrix.tsv.gz'
            stats = root / 'stats.tsv.gz'
            with gzip.open(matrix, 'wt', newline='') as handle:
                w = csv.writer(handle, delimiter='\t')
                w.writerow(['guide_identity', 'GENEA', 'GENEB', 'GENEC'])
                w.writerow(['AATF_AAAA', '1.2', '-2', 'nan'])
                w.writerow(['SMAD3_CCCC', '0.4', '0.7', '-0.1'])
                w.writerow(['SMAD3_GGGG', '-0.3', '0.8', '0.2'])
            with gzip.open(stats, 'wt', newline='') as handle:
                w = csv.writer(handle, delimiter='\t')
                w.writerow(['effect_score', 'p_val', 'p_val_adj', 'guide_id', 'target_gene', 'intended_target_name'])
                w.writerow(['0.3', '0.02', '0.04', 'SMAD3_CCCC', 'ENSG1', 'ENSG2'])
            result = build_export(matrix, stats, top_n=2)
            self.assertEqual(result['guide_count'], 3)
            self.assertEqual(result['statistical_guide_count'], 1)
            self.assertEqual(result['unmatched_statistical_guides'], 0)
            self.assertEqual(result['targets']['AATF'][0]['top_genes'][0], ['GENEB', -2.0])
            self.assertEqual(result['targets']['SMAD3'][0]['promoter_statistics'][0]['adjusted_p_value'], 0.04)
            self.assertEqual(result['targets']['SMAD3'][1]['promoter_statistics'], [])
            self.assertFalse(result['expression_effects_validated'])
            self.assertNotIn('nan', json.dumps(result))

    def test_repeated_guide_statistics_are_kept_as_distinct_tests(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with gzip.open(root/'m.gz', 'wt') as f:
                f.write('guide_identity\tGENEA\nMNX1_AAAA\t0.2\n')
            with gzip.open(root/'s.gz', 'wt') as f:
                f.write('guide_id\teffect_score\tp_val\tp_val_adj\ttarget_gene\tintended_target_name\n')
                f.write('MNX1_AAAA\t0.2\t0.02\t0.04\tENSG1\tENSG9\n')
                f.write('MNX1_AAAA\t0.3\t0.001\t0.002\tENSG2\tENSG9\n')
            result = build_export(root/'m.gz', root/'s.gz')
            guide = result['targets']['MNX1'][0]
            self.assertEqual(guide['promoter_statistics_count'], 2)
            self.assertEqual(len(guide['promoter_statistics']), 2)
            self.assertEqual(guide['promoter_statistics'][0]['measured_target_gene_id'], 'ENSG2')
            self.assertEqual(result['statistical_guide_count'], 1)
            self.assertEqual(result['statistical_test_count'], 2)

    def test_missing_header_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for filename, header in [('m.gz', 'wrong\tGENEA\n'), ('s.gz', 'guide_id\n')]:
                with gzip.open(root / filename, 'wt') as handle:
                    handle.write(header)
            with self.assertRaisesRegex(ValueError, 'Statistics file missing fields'):
                build_export(root/'m.gz', root/'s.gz')

    def test_rejects_duplicate_guides(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with gzip.open(root/'m.gz', 'wt') as f:
                f.write('guide_identity\tGENEA\nAATF_AAAA\t1\nAATF_AAAA\t2\n')
            with gzip.open(root/'s.gz', 'wt') as f:
                f.write('guide_id\teffect_score\tp_val\tp_val_adj\ttarget_gene\tintended_target_name\n')
            with self.assertRaisesRegex(ValueError, 'Duplicate'):
                build_export(root/'m.gz', root/'s.gz')

if __name__ == '__main__':
    unittest.main()
