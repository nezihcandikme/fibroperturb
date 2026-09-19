"""Synthetic tests: inspect metadata without exposing raw cell measurements."""
import sys
import tempfile
import unittest
from pathlib import Path

import h5py
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from assay_preflight import inspect_assay


class AssayPreflightTests(unittest.TestCase):
    def write_fixture(self, path: Path, *, include_guide=True):
        with h5py.File(path, 'w') as h5:
            m = h5.create_group('matrix')
            f = m.create_group('features')
            types = [b'Gene Expression', b'Gene Expression']
            names = [b'GENEA', b'GENEB']
            ids = [b'ENSG1', b'ENSG2']
            if include_guide:
                types += [b'CRISPR Guide Capture'] * 3
                names += [b'SMAD3', b'SMAD3', b'non_targeting']
                ids += [b'smad3_1', b'smad3_2', b'nt_1']
            f.create_dataset('feature_type', data=types)
            f.create_dataset('name', data=names)
            f.create_dataset('id', data=ids)
            f.create_dataset('sequence', data=[b''] * len(types))
            m.create_dataset('shape', data=[len(types), 2])
            m.create_dataset('indptr', data=[0, 2, 4])
            m.create_dataset('indices', data=[0, 1, 0, 1])
            m.create_dataset('data', data=[1, 2, 3, 4])
            m.create_dataset('barcodes', data=[b'private-1', b'private-2'])

    def test_aggregate_metadata_only(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'example.h5'
            self.write_fixture(path)
            result = inspect_assay(path)
            self.assertEqual(result['cell_count'], 2)
            self.assertEqual(result['guide_feature_count'], 3)
            self.assertEqual(result['unique_guide_targets'], 2)
            self.assertEqual(result['non_targeting_features'], 1)
            self.assertEqual(result['target_preview'][0]['target'], 'SMAD3')
            self.assertFalse(result['validated_perturbation_labels'])
            self.assertNotIn('private-1', str(result))
            self.assertNotIn('smad3_1', str(result))

    def test_missing_guide_capture_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'example.h5'
            self.write_fixture(path, include_guide=False)
            with self.assertRaisesRegex(ValueError, 'CRISPR Guide Capture'):
                inspect_assay(path)


if __name__ == '__main__':
    unittest.main()
