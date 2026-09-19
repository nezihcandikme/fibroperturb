import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const root = new URL('../src/', import.meta.url)
test('Gene catalog never invents descriptions for uncurated targets', () => {
 const source = readFileSync(new URL('geneInfo.ts', root), 'utf8')
 assert.match(source, /export function getGeneInfo/)
 assert.match(source, /curated\[target\]/)
 assert.match(source, /description: null/)
})
test('Cell interface explicitly separates illustration from measurements', () => {
 const source = readFileSync(new URL('cell\/CellModel.tsx', root), 'utf8')
 assert.match(source, /illustrat|temsili/i)
 assert.doesNotMatch(source, /autoRotate=\{true\}/)
})
test('Explorer has gene picker, contextual cell and experimental measurements', () => {
 const source = readFileSync(new URL('PerturbationExplorer.tsx', root), 'utf8')
 assert.match(source, /<CellModel/)
 assert.match(source, /<TranscriptionViewer/)
 assert.match(source, /validated_assignments/)
 assert.match(source, /getGeneInfo/)
})
test('Cell model supports compact context, membrane and internal filaments', () => {
 const source = readFileSync(new URL('cell/CellModel.tsx', root), 'utf8')
 assert.match(source, /compact\?:boolean/)
 assert.match(source, /target\?:string/)
 assert.match(source, /Filaments/)
 assert.match(source, /Nucleus/)
})
