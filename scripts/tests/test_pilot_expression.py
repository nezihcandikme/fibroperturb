"""Synthetic data exercises CSC group assignments and aggregate RNA normalization."""
from pathlib import Path
import tempfile
import unittest
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import numpy as np
import h5py
from pilot_expression import sample_pilot

class TestPilot(unittest.TestCase):
 def test_synthetic_sparse_10x(self):
  with tempfile.TemporaryDirectory() as temp:
   path=Path(temp)/'mini.h5'
   with h5py.File(path,'w') as f:
    m=f.create_group('matrix');feat=m.create_group('features')
    feat.create_dataset('feature_type',data=np.array([b'Gene Expression',b'Gene Expression',b'CRISPR Guide Capture',b'CRISPR Guide Capture']))
    feat.create_dataset('name',data=np.array([b'GENEA',b'GENEB',b'non_targeting',b'SMAD3']))
    m.create_dataset('shape',data=[4,3]);m.create_dataset('indptr',data=[0,3,6,9]);m.create_dataset('indices',data=[0,1,2,0,1,3,0,1,3]);m.create_dataset('data',data=[10,10,20,10,30,21,5,30,30])
   result=sample_pilot(path,('SMAD3',),scanned=3,max_group=5,minimum_guide_count=10,dominance=.8,minimum_rna=1)
   self.assertFalse(result['validated_assignments'])
   self.assertEqual(result['groups'][0]['candidate_cells'],1)
   self.assertEqual(result['groups'][1]['candidate_cells'],2)
   self.assertEqual(result['groups'][1]['top_rna_genes'][0]['gene'],'GENEB')
   self.assertTrue(result['groups'][1]['exploratory_log2_cpm_ratio_vs_non_targeting'])

if __name__=='__main__':unittest.main()
