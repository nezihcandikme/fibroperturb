import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const src = (file) => readFileSync(new URL(`../src/${file}`, import.meta.url),'utf8')
const data = JSON.parse(readFileSync(new URL('../public/demo-data/targets.json', import.meta.url),'utf8'))
test('real targets are available, not fabricated transcript measurements', () => {
 assert.ok(data.targets.length > 1000)
 assert.equal(data.validated_assignments, false)
 assert.ok(data.targets.every(x => Number.isInteger(x.candidate_cells) && x.candidate_cells >= 20 && x.median_dominance >= 0.8 && x.median_dominance <= 1))
})
test('explorer supports searchable target list and shows data provenance', () => {
 const code=src('PerturbationExplorer.tsx')
 assert.match(code,/searchQuery/)
 assert.match(code,/type="search"/)
 assert.match(code,/dataset\.dominance_threshold/)
 assert.match(code,/getGeneInfo/)
 assert.match(code,/non_targeting/)
})
test('molecular viewer is explained as a schematic, without pretend expression change', () => {
 const code=src('TranscriptionViewer.tsx')
 assert.match(code,/RNA polymerase/i)
 assert.match(code,/CRISPRa/)
 assert.match(code,/illustrat|temsili/i)
 assert.doesNotMatch(code,/Math\.random\(/)
})
test('gene info is honest for unknown targets and distinguishes protein classes', () => {
 const code=src('geneInfo.ts')
 assert.match(code,/description: null/)
 assert.match(code,/SMAD3/)
 assert.match(code,/AATF/)
})
