export type TargetMetric = {
  target: string
  candidate_cells: number
  median_dominance: number
  median_guide_count: number
  unique_top_guides: number
}
export type Dataset = {
  dataset: string
  analysis: string
  dominance_threshold: number
  minimum_top_guide_count: number
  minimum_candidate_cells_per_target: number
  validated_assignments: false
  targets: TargetMetric[]
}
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
export function parseDataset(value: unknown): Dataset {
  if (typeof value !== 'object' || value === null) throw new Error('Data must be an object')
  const d = value as Record<string, unknown>
  if (d.validated_assignments !== false || !Array.isArray(d.targets) || typeof d.dataset !== 'string' || typeof d.analysis !== 'string') throw new Error('Missing provenance or exploratory status')
  for (const key of ['dominance_threshold', 'minimum_top_guide_count', 'minimum_candidate_cells_per_target']) if (!finite(d[key])) throw new Error(`Invalid ${key}`)
  const threshold = d.dominance_threshold as number
  const minimumGuide = d.minimum_top_guide_count as number
  const minimumCells = d.minimum_candidate_cells_per_target as number
  if (threshold < 0 || threshold > 1 || minimumGuide < 0 || minimumCells < 0) throw new Error('Invalid thresholds')
  const seen = new Set<string>()
  for (const item of d.targets) {
    if (!item || typeof item.target !== 'string' || !item.target.trim() || seen.has(item.target)) throw new Error('Invalid or duplicate target')
    seen.add(item.target)
    for (const key of ['candidate_cells','median_dominance','median_guide_count','unique_top_guides']) {
      const metric = item[key]
      if (!finite(metric) || metric < 0) throw new Error(`Invalid ${key}`)
    }
    if (item.median_dominance > 1 || !Number.isInteger(item.candidate_cells) || !Number.isInteger(item.unique_top_guides)) throw new Error('Invalid counts or fraction')
  }
  return value as Dataset
}
const csvCell = (s: string | number): string => {
  const value = String(s)
  // Prevent spreadsheet formula execution in exported gene labels.
  const safe = /^[\s]*[=+@\-\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replaceAll('"','""')}"`
}
export function buildTargetCsv(rows: TargetMetric[]): string {
  const header = 'target,candidate_cells,median_dominance,median_guide_count,unique_top_guides,status'
  return [header,...rows.map(r=>[r.target,r.candidate_cells,r.median_dominance,r.median_guide_count,r.unique_top_guides,'exploratory_unvalidated_guide_capture'].map(csvCell).join(','))].join('\n')+'\n'
}
export function exportTargetCsv(rows: TargetMetric[]): void {
  const blob = new Blob([buildTargetCsv(rows)], {type:'text/csv;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href=url;link.download='fibroperturb-guide-capture-exploratory.csv';document.body.append(link);link.click();link.remove()
  URL.revokeObjectURL(url)
}
