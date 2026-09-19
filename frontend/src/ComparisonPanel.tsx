import type {Language} from './geneInfo'

export type TargetMetric = {
  target:string
  candidate_cells:number
  median_dominance:number
  median_guide_count:number
  unique_top_guides:number
}

const translations = {
 TR:{title:'İki hedefi karşılaştır',description:'Bunlar iki genin biyolojik etkilerini değil, keşif amaçlı guide-yakalama özetlerini karşılaştırır.',primary:'Seçili hedef',secondary:'Karşılaştırılacak hedef',cells:'Aday hücre',guides:'Baskın guide çeşidi',fraction:'Medyan baskın guide payı',counts:'Medyan guide sayımı',none:'Karşılaştırma için ikinci hedef seçin.',warning:'Aday hücre sayısı daha yüksek olan bir hedefin biyolojik etkisi daha güçlü olmak zorunda değildir.'},
 EN:{title:'Compare two targets',description:'This compares exploratory guide-capture summaries, not the biological effects of two genes.',primary:'Selected target',secondary:'Comparison target',cells:'Candidate cells',guides:'Distinct dominant guides',fraction:'Median dominant-guide share',counts:'Median guide count',none:'Choose a second target to compare.',warning:'A larger candidate-cell count does not imply a stronger biological effect.'}
}

export default function ComparisonPanel({language,current,compareTarget,onChange,targets}:{language:Language;current:TargetMetric;compareTarget:string;onChange:(target:string)=>void;targets:TargetMetric[]}){
 const t=translations[language]
 const other=targets.find(item=>item.target===compareTarget && item.target!==current.target)
 const metrics=[
  {label:t.cells,key:'candidate_cells' as const,format:(n:number)=>Math.round(n).toLocaleString(language==='TR'?'tr-TR':'en-US')},
  {label:t.guides,key:'unique_top_guides' as const,format:(n:number)=>String(n)},
  {label:t.fraction,key:'median_dominance' as const,format:(n:number)=>(n*100).toFixed(1)+'%'},
  {label:t.counts,key:'median_guide_count' as const,format:(n:number)=>n.toFixed(1)}
 ]
 return <section className="comparison-panel" aria-label={t.title}>
  <div className="comparison-head"><div><span className="eyebrow">03 / SIDE BY SIDE</span><h3>{t.title}</h3><p>{t.description}</p></div><div className="comparison-picker"><label htmlFor="compare-target">{t.secondary}</label><select id="compare-target" value={other?.target??''} onChange={event=>onChange(event.target.value)}><option value="">—</option>{targets.filter(item=>item.target!==current.target).map(item=><option key={item.target} value={item.target}>{item.target}</option>)}</select></div></div>
  {other?<div className="comparison-body"><div className="comparison-columns"><span>{t.primary}: <b>{current.target}</b></span><span>{t.secondary}: <b>{other.target}</b></span></div>{metrics.map(({label,key,format})=>{const a=current[key],b=other[key],max=Math.max(a,b,Number.EPSILON);return <div className="metric-compare" key={key}><div className="metric-title">{label}</div><div className="compare-bars"><div className="compare-bar"><span>{format(a)}</span><div className="bar-track"><div className="bar-fill primary-bar" style={{width:`${a/max*100}%`}}/></div></div><div className="compare-bar"><span>{format(b)}</span><div className="bar-track"><div className="bar-fill secondary-bar" style={{width:`${b/max*100}%`}}/></div></div></div></div>})}</div>:<p className="compare-empty">{t.none}</p>}
  <p className="comparison-caveat">{t.warning}</p>
 </section>
}
