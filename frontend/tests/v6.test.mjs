import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const overview=readFileSync(new URL('../src/TargetOverview.tsx',import.meta.url),'utf8')
const report=readFileSync(new URL('../../scripts/assay_preflight.py',import.meta.url),'utf8')
test('target overview count derives from loaded dataset, not a hardcoded count',()=>{
  assert.match(overview,/DATASET \/ \{targets\.length/)
  assert.doesNotMatch(overview,/DATASET \/ 1836/)
})
test('local assay preflight does not serialize cell barcodes or guide sequences',()=>{
  assert.match(report,/validated_perturbation_labels.*False/)
  assert.doesNotMatch(report,/\['barcodes'\]/)
  assert.doesNotMatch(report,/\['sequence'\]/)
})
