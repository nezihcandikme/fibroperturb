import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=(file)=>readFileSync(new URL('../src/'+file,import.meta.url),'utf8')
test('explorer contains contextual target comparison and clear data status',()=>{
 const s=source('PerturbationExplorer.tsx')
 assert.match(s,/compareTarget/)
 assert.match(s,/ComparisonPanel/)
 assert.match(s,/validated_assignments/)
})
test('cell uses restrained biological palette and distinct organelle labels',()=>{
 const s=source('cell/CellModel.tsx')
 assert.match(s,/MEMBRANE_COLOR/)
 assert.match(s,/NUCLEUS_COLOR/)
 assert.match(s,/MITO_COLOR/)
 assert.match(s,/aria-label/)
})
test('the demo has an explicit interpretation guide and data provenance',()=>{
 const s=source('DataGuide.tsx')
 assert.match(s,/CRISPRa/)
 assert.match(s,/guide/)
 assert.match(s,/validated/)
})
