import { useMemo, useState } from 'react'
import { exportTargetCsv, type TargetMetric } from './dataModel'
import type { Language } from './geneInfo'
const translations = {
 TR: {title:'Tüm hedefleri keşfedin',text:'Hs27 guide-yakalama verilerinin arama yapılabilir, keşif amaçlı özeti.',filter:'Hedef adıyla filtrele',sort:'Sırala',cells:'Aday hücre',alpha:'Gen adına göre',guides:'Guide çeşidi',dominance:'Baskın guide payı',open:'İncele',export:'Görünür satırları CSV indir',count:'hedef',empty:'Eşleşen hedef yok.',caveat:'CSV yalnızca toplu guide-yakalama verilerini içerir. Ekspresyon etkisi veya doğrulanmış perturbasyon etiketi içermez.'},
 EN: {title:'Explore all targets',text:'A searchable, exploratory overview of the Hs27 guide-capture dataset.',filter:'Filter by target name',sort:'Sort by',cells:'Candidate cells',alpha:'Gene symbol',guides:'Distinct guides',dominance:'Dominant-guide share',open:'Explore',export:'Download visible rows as CSV',count:'targets',empty:'No matching targets.',caveat:'CSV contains aggregate guide-capture data only, not expression effects or validated perturbation labels.'}
}
type Sort = 'candidate_cells'|'target'|'unique_top_guides'|'median_dominance'
export default function TargetOverview({language,targets,onSelect}:{language:Language;targets:TargetMetric[];onSelect:(name:string)=>void}){
 const t=translations[language]
 const [filter,setFilter]=useState('')
 const [sort,setSort]=useState<Sort>('candidate_cells')
 const [page,setPage]=useState(0)
 const filtered=useMemo(()=>targets.filter(item=>item.target.toUpperCase().includes(filter.trim().toUpperCase())).sort((a,b)=>sort==='target'?a.target.localeCompare(b.target):b[sort]-a[sort]||a.target.localeCompare(b.target)),[targets,filter,sort])
 const visible=filtered.slice(page*12,(page+1)*12)
 const fmt=new Intl.NumberFormat(language==='TR'?'tr-TR':'en-US')
 return <section className="target-overview" aria-label={t.title}>
  <div className="overview-head"><div><span className="eyebrow">DATASET / {targets.length.toLocaleString(language === 'TR' ? 'tr-TR' : 'en-US')}</span><h3>{t.title}</h3><p>{t.text}</p></div><button className="overview-export" type="button" onClick={()=>exportTargetCsv(filtered)} disabled={!filtered.length}>{t.export} ↗</button></div>
  <div className="overview-tools"><label>{t.filter}<input type="search" value={filter} onChange={e=>{setFilter(e.target.value);setPage(0)}} placeholder="AATF, SMAD3…"/></label><label>{t.sort}<select value={sort} onChange={e=>{setSort(e.target.value as Sort);setPage(0)}}><option value="candidate_cells">{t.cells}</option><option value="target">{t.alpha}</option><option value="unique_top_guides">{t.guides}</option><option value="median_dominance">{t.dominance}</option></select></label></div>
  <div className="overview-table-scroll"><table><thead><tr><th scope="col">GENE</th><th scope="col">{t.cells}</th><th scope="col">{t.guides}</th><th scope="col">{t.dominance}</th><th scope="col"><span className="sr-only">{t.open}</span></th></tr></thead><tbody>{visible.map(item=><tr key={item.target}><th scope="row">{item.target}</th><td>{fmt.format(item.candidate_cells)}</td><td>{fmt.format(item.unique_top_guides)}</td><td>{(item.median_dominance*100).toFixed(1)}%</td><td><button type="button" onClick={()=>onSelect(item.target)}>{t.open} ↗</button></td></tr>)}</tbody></table>{!visible.length&&<p className="overview-empty">{t.empty}</p>}</div>
  <div className="overview-foot"><span>{fmt.format(filtered.length)} {t.count} · {filtered.length?`${page*12+1}–${Math.min((page+1)*12,filtered.length)}`:'0'}</span><div><button type="button" disabled={!page} onClick={()=>setPage(p=>p-1)} aria-label="Previous page">←</button><button type="button" disabled={(page+1)*12>=filtered.length} onClick={()=>setPage(p=>p+1)} aria-label="Next page">→</button></div></div><p className="overview-caveat">{t.caveat}</p>
 </section>
}
