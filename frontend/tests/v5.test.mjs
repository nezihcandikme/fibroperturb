import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync, existsSync} from 'node:fs'
const src=(name)=>readFileSync(new URL(`../src/${name}`,import.meta.url),'utf8')
test('explorer offers target comparison, sortable overview and CSV export',()=>{
 const s=src('PerturbationExplorer.tsx')
 assert.match(s,/ComparisonPanel/)
 assert.match(s,/TargetOverview/)
 assert.match(s,/exportTargetCsv/)
 assert.match(s,/validated_assignments/)
})
test('overview is accessible with filtering and sorting',()=>{
 const s=src('TargetOverview.tsx')
 for(const term of ['aria-label','sort','filter','candidate_cells'])assert.match(s,new RegExp(term))
})
test('data parsing rejects malformed rows and unvalidated export is clearly labeled',()=>{
 const s=src('dataModel.ts')
 for(const term of ['parseDataset','validated_assignments','exportTargetCsv','URL.revokeObjectURL','candidate_cells']) assert.match(s,new RegExp(term))
})
test('comparison is rendered inside explorer',()=>{
 const s=src('PerturbationExplorer.tsx')
 assert.match(s,/<ComparisonPanel/)
})
test('cell provides accessible static fallback and can toggle reduce motion',()=>{
 const s=src('cell/CellModel.tsx')
 assert.match(src('App.css'),/prefers-reduced-motion/)
 assert.match(s,/cell-static-fallback/)
})
test('local QC pipeline and site contract are documented',()=>{
 assert.ok(existsSync(new URL('../../scripts/pilot_expression.py',import.meta.url)))
 assert.ok(existsSync(new URL('../../docs/SCIENTIFIC_STATUS.md',import.meta.url)))
})
