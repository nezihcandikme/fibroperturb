import { useEffect, useMemo, useState } from 'react'
import type { Language } from './geneInfo'

type GuideResult = {
  guide_id: string
  measured_gene_count: number
  top_genes: [string, number][]
  promoter_statistics_count: number
  promoter_statistics: {
    effect_score: number | null
    p_value: number | null
    adjusted_p_value: number | null
    measured_target_gene_id: string
    intended_target_gene_id: string
  }[]
}
type PublishedData = {
  schema_version: 2
  expression_effects_validated: false
  guide_count: number
  measured_gene_columns: number
  statistical_guide_count: number
  statistical_test_count: number
  promoter_statistics_preview_limit: number
  top_n_by_absolute_value: number
  targets: Record<string, GuideResult[]>
}
function valid(v: unknown): v is PublishedData {
  if (!v || typeof v !== 'object') return false
  const d = v as Record<string, unknown>
  return d.schema_version === 2 && d.expression_effects_validated === false &&
    Number.isInteger(d.guide_count) && Number.isInteger(d.measured_gene_columns) &&
    Number.isInteger(d.statistical_guide_count) && Number.isInteger(d.statistical_test_count) && Number.isInteger(d.promoter_statistics_preview_limit) && Number.isInteger(d.top_n_by_absolute_value) &&
    !!d.targets && typeof d.targets === 'object' && !Array.isArray(d.targets)
}
const text = {
  TR: {
    eyebrow: 'IGVF / YAYIMLANMIŞ SONUÇLAR', title: 'Guide düzeyinde sonuçlar.',
    description: 'Kaynak analizden aktarılan guide × gen sayısal sonuçları. Burada gösterilen liste, her guide için mutlak değeri en büyük sınırlı sayıdaki genin ön izlemesidir.',
    missing: 'Bu hedef için yayımlanmış guide × gen matrisinde sonuç bulunmuyor.',
    pending: 'Yayımlanmış sonuç özeti henüz oluşturulmadı. Mac’inizde proje kökünde şu komutu çalıştırın:',
    error: 'Sonuç dosyası okunamadı veya beklenen şemaya uymuyor. Yerel dışa aktarımı yeniden çalıştırın.',
    select: 'Guide seç', top: 'Gen', value: 'Yayımlanmış değer',
    stat: 'Promoter düzeyinde istatistik kayıtları', noStat: 'Bu guide için ayrı promoter istatistik kaydı bulunmuyor.',
    tests: 'kayıt', preview: 'En düşük düzeltilmiş p-değerine göre ön izleme; her satır farklı bir hedefe ilişkin testtir.', measured: 'Ölçülen hedef', intended: 'Amaçlanan hedef',
    score: 'Effect score', adjusted: 'Düzeltilmiş p', p: 'p-değeri',
    caveat: 'Önemli: Bu değerlerin tam ölçeği ve işareti kaynak analiz yöntemi üzerinden henüz bağımsız olarak doğrulanmadı. En yüksek mutlak değerlere göre sıralama istatistiksel anlamlılık değildir. Promoter testi bir başka genin aşağı akış ekspresyonunun p-değeri olarak kullanılamaz. Bu panel CRISPRa başarısını, nedenselliği veya tahmin gücünü kanıtlamaz.',
    provenance: 'Kaynak: IGVFDS2001NDKP · Matris: IGVFFI6892KBHM · Promoter istatistikleri: IGVFFI2104BKIF',
    limited: 'Genler yalnızca en yüksek mutlak değerli ön izleme listesinden gösteriliyor; listede olmayan genin ölçülmediği veya etkisiz olduğu sonucu çıkarılamaz.',
  },
  EN: {
    eyebrow: 'IGVF / PUBLISHED RESULTS', title: 'Guide-level results.',
    description: 'Published guide-by-gene numerical results. The table previews only a limited set of genes with the largest absolute values for each guide.',
    missing: 'No guide-by-gene matrix results are available for this target.',
    pending: 'The published-results summary has not been generated. Run this command from the project root on your Mac:',
    error: 'The published-results export is unreadable or has the wrong schema. Regenerate the local export.',
    select: 'Select guide', top: 'Gene', value: 'Published value',
    stat: 'Promoter-level statistics records', noStat: 'No separate promoter-level statistics record is available for this guide.',
    tests: 'tests', preview: 'Preview sorted by smallest adjusted p-value; each row represents a distinct tested target.', measured: 'Measured target', intended: 'Intended target',
    score: 'Effect score', adjusted: 'Adjusted p', p: 'p-value',
    caveat: 'Important: The exact scale and direction of these values have not yet been independently verified against the source analysis method. Ranking by absolute value is not statistical significance. A promoter test cannot be used as a downstream gene-expression p-value. This panel does not demonstrate successful CRISPRa activation, causality or predictive performance.',
    provenance: 'Source: IGVFDS2001NDKP · Matrix: IGVFFI6892KBHM · Promoter statistics: IGVFFI2104BKIF',
    limited: 'Only the largest-absolute-value preview is shown. A gene absent from this list may still have been measured or affected.',
  },
}
export default function PublishedResults({ target, language }: { target: string; language: Language }) {
  const [data, setData] = useState<PublishedData | null>(null)
  const [status, setStatus] = useState<'loading'|'missing'|'error'|'ready'>('loading')
  const [selectedGuide, setSelectedGuide] = useState('')
  const t = text[language]
  useEffect(() => {
    const abort = new AbortController()
    fetch(`${import.meta.env.BASE_URL}demo-data/published-results.json`, { signal: abort.signal })
      .then(async response => {
        if (response.status === 404) { setStatus('missing'); return }
        if (!response.ok) throw Error(`HTTP ${response.status}`)
        const json: unknown = await response.json()
        if (!valid(json)) throw Error('Invalid results contract')
        setData(json); setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === 'AbortError')) setStatus('error')
      })
    return () => abort.abort()
  }, [])
  const guides = useMemo(() => data?.targets[target] ?? [], [data, target])
  const current = guides.find(g => g.guide_id === selectedGuide) ?? guides[0]
  const format = (value: number | null) => value === null ? '—' : new Intl.NumberFormat(language === 'TR' ? 'tr-TR' : 'en-US', { maximumSignificantDigits: 4 }).format(value)
  return <section className="published-results" aria-label={t.title}>
    <span className="eyebrow">{t.eyebrow}</span>
    <h3>{t.title}</h3>
    <p className="published-description">{t.description}</p>
    {status === 'loading' && <p role="status">Loading…</p>}
    {status === 'missing' && <div className="published-pending" role="status"><p>{t.pending}</p><code>.venv/bin/python scripts/export_published_results.py</code></div>}
    {status === 'error' && <p role="alert">{t.error}</p>}
    {status === 'ready' && !guides.length && <p className="published-pending">{t.missing}</p>}
    {status === 'ready' && current && <>
      <div className="published-meta"><span>{target} · {guides.length} guides</span><span>{data?.measured_gene_columns} gene columns · {data?.top_n_by_absolute_value} preview genes / guide</span></div>
      <label className="published-guide-label" htmlFor="published-guide">{t.select}</label>
      <select id="published-guide" className="published-guide-select" value={current.guide_id} onChange={e => setSelectedGuide(e.target.value)}>
        {guides.map(guide => <option key={guide.guide_id} value={guide.guide_id}>{guide.guide_id}</option>)}
      </select>
      <div className="published-table-wrap"><table className="published-table"><thead><tr><th scope="col">{t.top}</th><th scope="col">{t.value}</th></tr></thead><tbody>{current.top_genes.map(([gene, value]) => <tr key={gene}><th scope="row">{gene}</th><td className="published-numeric">{format(value)}</td></tr>)}</tbody></table></div>
      <p className="published-limited">{t.limited}</p>
      <div className="published-stat"><h4>{t.stat} · {current.promoter_statistics_count} {t.tests}</h4>{current.promoter_statistics.length ? <><p className="published-limited">{t.preview} ({current.promoter_statistics.length}/{current.promoter_statistics_count})</p><div className="published-table-wrap"><table className="published-table"><thead><tr><th scope="col">{t.measured}</th><th scope="col">{t.intended}</th><th scope="col">{t.score}</th><th scope="col">{t.p}</th><th scope="col">{t.adjusted}</th></tr></thead><tbody>{current.promoter_statistics.map((record, index) => <tr key={`${record.measured_target_gene_id}-${record.intended_target_gene_id}-${index}`}><th scope="row">{record.measured_target_gene_id}</th><td>{record.intended_target_gene_id}</td><td className="published-numeric">{format(record.effect_score)}</td><td className="published-numeric">{format(record.p_value)}</td><td className="published-numeric">{format(record.adjusted_p_value)}</td></tr>)}</tbody></table></div></> : <p>{t.noStat}</p>}</div>
    </>}
    <p className="published-warning">{t.caveat}</p><p className="published-provenance">{t.provenance}</p>
  </section>
}
