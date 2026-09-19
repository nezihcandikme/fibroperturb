import { useEffect, useMemo, useState } from 'react'
import CellModel from './cell/CellModel'
import TranscriptionViewer from './TranscriptionViewer'
import ComparisonPanel from './ComparisonPanel'
import TargetOverview from './TargetOverview'
import PublishedResults from './PublishedResults'
import { parseDataset, exportTargetCsv, type TargetMetric, type Dataset } from './dataModel'
import { getGeneInfo, type Language } from './geneInfo'

const copy = {
  TR: { eyebrow: 'FIBROPERTURB / EXPLORER', title: 'Bir geni seçin. İçeride ne olduğunu keşfedin.', intro: 'Moleküler süreçleri anlaşılır bir şemayla inceleyin; ardından gerçek Hs27 guide-capture ölçümlerine bakın.', search: 'Hedef gen ara', searchHelp: 'Gen sembolü girin · örn. SMAD3, AATF veya ELK3', result: 'arama sonucu', choose: 'Hedefi seç', notFound: 'Bu aramayla eşleşen hedef yok.', gene: 'GENİN İŞLEVİ', uncurated: 'Bu gen için doğrulanmış işlev açıklaması henüz eklenmedi. Sembolü Hs27 deneyinin guide metadata alanından alınmıştır.', why: 'Transkripsiyon faktörü nedir?', whyText: 'Transkripsiyon faktörleri genlerin ne kadar RNA üreteceğini düzenleyebilen proteinlerdir. Her hedef gen transkripsiyon faktörü değildir. CRISPRa bir genin transkripsiyonunu artırmayı amaçlar; başarılı aktivasyonun ayrıca doğrulanması gerekir.', illustrative: 'Temsili hücre modeli · bu genin ölçülmüş etkisi değildir', measured: 'DENEYSEL VERİ', measuredTitle: 'Deneyden gelen sayılar.', cells: 'Aday hücre', guides: 'Farklı baskın guide', fraction: 'Medyan baskın guide payı', counts: 'Medyan baskın guide sayımı', methods: 'Bu sayılar nasıl hesaplandı?', methodA: 'Bir hücre, en yüksek sayımlı guide seçilen hedefe aitse ve bu guide toplam yakalama sayısının en az ', methodB: ' kadarını oluşturup en az ', methodC: ' sayım taşıyorsa adaydır. Bu sınırlar yalnızca demo için belirlenen keşif filtreleridir; biyolojik doğrulama ölçütleri değildir.', limitation: 'Henüz doğrulanmış perturbasyon atamaları veya gen ekspresyonu değişimleri yok. Buradaki sayılar guide yakalama ölçümleridir; transkripsiyon artışı ya da model tahmini değildir.', loading: 'Hs27 verisi yükleniyor…', error: 'Veriler yüklenemedi. demo-data/targets.json dosyasının mevcut olduğundan emin olun.', summary: 'Gen adları ve biyolojik mekanizma genel açıklamalardır; sayısal ölçümler yerel Hs27 analizinden gelir.' },
  EN: { eyebrow: 'FIBROPERTURB / EXPLORER', title: 'Choose a gene. Explore what happens inside.', intro: 'Explore a clear schematic of the molecular process, then investigate real Hs27 guide-capture measurements.', search: 'Search target genes', searchHelp: 'Enter a gene symbol · e.g. SMAD3, AATF or ELK3', result: 'matching targets', choose: 'Select target', notFound: 'No targets match this search.', gene: 'GENE FUNCTION', uncurated: 'No verified functional description has been added for this gene. The symbol comes from the Hs27 guide metadata.', why: 'What is a transcription factor?', whyText: 'Transcription factors are proteins that can regulate how much RNA a gene produces. Not every target gene is a transcription factor. CRISPRa aims to increase transcription; successful activation requires separate validation.', illustrative: 'Illustrative cell model · not a measured effect of this gene', measured: 'EXPERIMENTAL DATA', measuredTitle: 'Measurements from the experiment.', cells: 'Candidate cells', guides: 'Distinct dominant guides', fraction: 'Median dominant-guide share', counts: 'Median dominant-guide count', methods: 'How were these values calculated?', methodA: 'A cell is a candidate when its most abundant guide belongs to the chosen target, accounts for at least ', methodB: ' of total guide-capture counts and has at least ', methodC: ' counts. These thresholds are exploratory display filters, not biological validation criteria.', limitation: 'Perturbation assignments and gene-expression changes have not yet been validated. These values describe captured guides, not increased transcription or model predictions.', loading: 'Loading Hs27 data…', error: 'Could not load the data. Check demo-data/targets.json.', summary: 'Gene annotations and molecular mechanism are general explanations; numerical measurements come from the local Hs27 analysis.' },
}
const examples = ['SMAD3','AATF','ELK3','FOXL2']
export default function PerturbationExplorer({language}:{language:Language}) {
  const [dataset,setDataset] = useState<Dataset|null>(null)
  const [failed,setFailed] = useState(false)
  const [selected,setSelected] = useState('SMAD3')
  const [compareTarget,setCompareTarget] = useState('')
  const [searchQuery,setSearchQuery] = useState('')
  const [searchOpen,setSearchOpen] = useState(false)
  const t = copy[language]
  useEffect(()=>{
    const abort=new AbortController()
    fetch(`${import.meta.env.BASE_URL}demo-data/targets.json`,{signal:abort.signal})
      .then(r=>{if(!r.ok) throw Error(`HTTP ${r.status}`); return r.json()})
      .then((json:unknown)=>setDataset(parseDataset(json)))
      .catch(err=>{if(err.name !== 'AbortError') setFailed(true)})
    return ()=>abort.abort()
  },[])
  const targets: TargetMetric[]=useMemo(()=>dataset?.targets.filter(x=>x.target !== 'non_targeting')??[],[dataset])
  const matches=useMemo(()=>{
    const query=searchQuery.trim().toUpperCase()
    return (query ? targets.filter(x=>x.target.toUpperCase().includes(query)) : targets.filter(x=>examples.includes(x.target))).slice(0,12)
  },[targets,searchQuery])
  if(failed) return <section className="perturbation-explorer" id="explorer" role="alert">{t.error}</section>
  if(!dataset) return <section className="perturbation-explorer" id="explorer" role="status">{t.loading}</section>
  const current=targets.find(x=>x.target===selected)??targets[0]
  if(!current) return <section className="perturbation-explorer" id="explorer" role="status">{t.error}</section>
  const gene=getGeneInfo(current.target,language)
  const fmt=new Intl.NumberFormat(language==='TR'?'tr-TR':'en-US',{maximumFractionDigits:1})
  const choose=(name:string)=>{setSelected(name);if(name===compareTarget)setCompareTarget('');setSearchQuery('');setSearchOpen(false)}
  return <section className="perturbation-explorer" id="explorer">
    <div className="explorer-lead"><span className="eyebrow">{t.eyebrow}</span><h2>{t.title}</h2><p>{t.intro}</p></div>
    <div className="gene-toolbar"><div className="gene-search"><label htmlFor="gene-search">{t.search}</label><input id="gene-search" type="search" autoComplete="off" value={searchQuery} placeholder={t.searchHelp} onChange={e=>{setSearchQuery(e.target.value);setSearchOpen(true)}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false);if(e.key==='Enter'&&matches.length)choose(matches[0].target)}} aria-expanded={searchOpen} aria-controls="gene-search-results" />{searchOpen&&<div id="gene-search-results" className="gene-search-results"><div className="search-count">{matches.length} {t.result}</div>{matches.length?matches.map(item=><button type="button" key={item.target} onClick={()=>choose(item.target)}><span>{item.target}</span><small>{fmt.format(item.candidate_cells)} {t.cells.toLowerCase()}</small></button>):<p>{t.notFound}</p>}</div>}</div><div className="gene-toolbar-right"><span>Hs27 / CRISPRa</span><span>01 — 03</span></div></div>
    <div className="target-statement"><div><span className="eyebrow">{t.gene}</span><h3>{current.target}</h3><p className="gene-fullname">{gene.name}</p></div><div className="target-description">{gene.type&&<span className="gene-type">{gene.type}</span>}<p>{gene.description??t.uncurated}</p><details><summary>{t.why}</summary><p>{t.whyText}</p></details></div></div>
    <div className="experiment-stage"><div className="experiment-cell"><CellModel language={language} compact target={current.target}/><div className="experiment-caption"><span>FIG. 01 / Hs27 fibroblast</span><span>{t.illustrative}</span></div></div><div className="experiment-mechanism"><TranscriptionViewer target={current.target} language={language}/></div></div>
    <PublishedResults target={current.target} language={language}/>
    <ComparisonPanel language={language} current={current} compareTarget={compareTarget} onChange={setCompareTarget} targets={targets}/>
    <section className="evidence-panel" data-validated-assignments={dataset.validated_assignments} aria-label={t.measured}><header><span className="eyebrow">{t.measured}</span><h3>{t.measuredTitle}</h3><p>{t.summary}</p></header><div className="evidence-grid"><div><span>{t.cells}</span><strong>{fmt.format(current.candidate_cells)}</strong></div><div><span>{t.guides}</span><strong>{fmt.format(current.unique_top_guides)}</strong></div><div><span>{t.fraction}</span><strong>{fmt.format(current.median_dominance*100)}%</strong></div><div><span>{t.counts}</span><strong>{fmt.format(current.median_guide_count)}</strong></div></div><details><summary>{t.methods}</summary><p>{t.methodA}{fmt.format(dataset.dominance_threshold*100)}%{t.methodB}{fmt.format(dataset.minimum_top_guide_count)}{t.methodC}</p></details><p className="data-warning">{t.limitation}</p></section>
    <div className="overview-export-current"><button type="button" onClick={()=>exportTargetCsv([current])}>{language==='TR'?'Seçili hedefi CSV indir ↗':'Download selected target CSV ↗'}</button></div>
    <TargetOverview language={language} targets={targets} onSelect={(name)=>{choose(name);document.getElementById('explorer')?.scrollIntoView({behavior:'smooth'})}}/>
  </section>
}