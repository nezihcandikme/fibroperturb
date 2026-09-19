import { useState } from 'react'
import type { Language } from './geneInfo'

const copy = {
 TR: {
  title:'Mekanizmayı keşfedin.', subtitle:'Seçtiğiniz hedef için genel CRISPRa işleyişi — ölçülmüş bir sonuç değil.', steps:['Hedefleme','RNA üretimi','Olası düzenleme'],
  descriptions:[
   'CRISPRa, guide RNA ve DNA’ya bağlanan etkinleştirici bir sistemle seçilen genin düzenleyici bölgesini hedeflemeyi amaçlar. DNA dizisini kesmek zorunda değildir.',
   'Başarılı bir aktivasyonda RNA polimeraz hedef genin RNA kopyalarını sentezleyebilir. Protein kodlayan genlerde bu RNA daha sonra protein üretimine katkıda bulunabilir.',
   'Üretilen protein bir transkripsiyon faktörü veya düzenleyiciyse başka genlerin ifadesini etkileyebilir. Hangi genlerin ne kadar değiştiği, ancak deneysel ekspresyon analiziyle belirlenebilir.'
  ], dna:'DNA / hedef gen', guide:'CRISPRa / guide RNA', polymerase:'RNA polymerase', rna:'mRNA', protein:'Üretilen protein', downstream:'Diğer genler', note:'Temsili mekanizma şemasıdır; seçili gen için doğrulanmış aktivasyon, doğrudan bağlanma veya ekspresyon değişimi göstermez.', next:'Sonraki aşama', back:'Önceki aşama'
 },
 EN: {
  title:'Explore the mechanism.', subtitle:'General CRISPRa workflow for the selected target — not a measured result.', steps:['Targeting','RNA synthesis','Possible regulation'],
  descriptions:[
   'CRISPRa aims to target a regulatory region of the chosen gene using guide RNA and a DNA-binding activator system. It need not cut the DNA sequence.',
   'If activation succeeds, RNA polymerase can synthesize RNA copies of the target gene. For protein-coding genes, this RNA may then support protein production.',
   'If the protein is a transcription factor or regulator, it may affect the expression of other genes. Which genes change, and by how much, requires experimental expression analysis.'
  ], dna:'DNA / target gene', guide:'CRISPRa / guide RNA', polymerase:'RNA polymerase', rna:'mRNA', protein:'Produced protein', downstream:'Other genes', note:'Illustrative mechanism schematic; it does not show validated activation, direct binding or expression changes for the chosen target.', next:'Next step', back:'Previous step'
 }
}

export default function TranscriptionViewer({target,language}:{target:string;language:Language}) {
 const [step,setStep]=useState(0)
 const t=copy[language]
 return <section className="transcription-viewer" aria-label={t.title}>
   <header className="transcription-heading"><span className="eyebrow">02 / MOLECULAR VIEW</span><h3>{t.title}</h3><p>{t.subtitle}</p></header>
   <div className="transcription-steps" role="group" aria-label={t.title}>{t.steps.map((name,i)=><button key={name} className={step===i?'transcription-step selected':'transcription-step'} type="button" aria-pressed={step===i} onClick={()=>setStep(i)}><span>0{i+1}</span>{name}</button>)}</div>
   <div className="molecular-stage"><div className="molecular-head"><span>{target}</span><span>0{step+1} / 03</span></div>
     <svg className="mechanism-svg" viewBox="0 0 680 255" role="img" aria-label={`${t.steps[step]} — ${t.descriptions[step]}`}>
       <defs><linearGradient id="dnaShade" x1="0" x2="1"><stop stopColor="#555"/><stop offset="1" stopColor="#AAA"/></linearGradient></defs>
       <text x="20" y="23" className="diagram-label">{t.dna}</text>
       <path d="M20 103 C60 30 95 30 135 103 S210 176 250 103 S325 30 365 103 S440 176 480 103 S555 30 595 103 S645 176 660 103" fill="none" stroke="url(#dnaShade)" strokeWidth="3"/>
       <path d="M20 103 C60 176 95 176 135 103 S210 30 250 103 S325 176 365 103 S440 30 480 103 S555 176 595 103 S645 30 660 103" fill="none" stroke="#B1AAA4" strokeWidth="3"/>
       {Array.from({length:32},(_,i)=>{const x=20+i*20;const offset=57*Math.sin((x-20)*Math.PI/115);return <line key={i} x1={x} x2={x} y1={103+offset} y2={103-offset} stroke="#C5BDB6" strokeWidth="1.4"/>})}
       <rect x="293" y="37" width="96" height="132" rx="12" fill={step===0?'#E3DBD1':'#F3EFE9'} fillOpacity=".72" stroke="#8B827A" strokeDasharray="4 5"/>
       {step===0&&<><rect x="283" y="4" width="116" height="28" rx="14" fill="#292724"/><text x="341" y="22" textAnchor="middle" fill="white" fontSize="11">CRISPRa</text><path d="M341 32 V41" stroke="#292724" strokeWidth="2"/><text x="341" y="194" textAnchor="middle" className="diagram-label">{t.guide}</text></>}
       {step>=1&&<><rect x="274" y="54" width="135" height="55" rx="25" fill="#AAA297" stroke="#6E675F"/><text x="341" y="86" fill="white" textAnchor="middle" fontSize="11">{t.polymerase}</text><path d="M341 110 C365 160 396 147 420 177 S480 190 508 169" stroke="#87776C" strokeWidth="3" fill="none" strokeDasharray="5 5"/><text x="477" y="213" className="diagram-label">{t.rna}</text></>}
       {step===2&&<><path d="M500 195 H570" stroke="#777" strokeWidth="1.6"/><path d="M563 190 L570 195 L563 200" stroke="#777" fill="none" strokeWidth="1.6"/><text x="569" y="230" textAnchor="middle" className="diagram-label">{t.protein} / {t.downstream}</text></>}
     </svg>
     <div className="mechanism-explainer"><h4>{t.steps[step]}</h4><p>{t.descriptions[step]}</p></div>
   </div>
   <div className="mechanism-footer"><p>{t.note}</p><div><button type="button" disabled={step===0} onClick={()=>setStep(step-1)} aria-label={t.back}>←</button><button type="button" disabled={step===2} onClick={()=>setStep(step+1)} aria-label={t.next}>→</button></div></div>
 </section>
}
