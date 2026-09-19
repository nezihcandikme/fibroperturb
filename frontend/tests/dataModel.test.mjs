import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const data=JSON.parse(readFileSync(new URL('../public/demo-data/targets.json',import.meta.url)))
test('dataset has unique target identifiers and bounded values',()=>{
 assert.equal(data.validated_assignments,false)
 assert.equal(new Set(data.targets.map(r=>r.target)).size,data.targets.length)
 assert.ok(data.targets.every(r=>Number.isInteger(r.candidate_cells) && r.candidate_cells>=20 && r.median_dominance>=0 && r.median_dominance<=1))
})
test('measured values are not labeled as gene expression effects',()=>{
 assert.equal(data.analysis,'Exploratory guide-capture summary')
 assert.ok(!('expression_effects' in data))
})
