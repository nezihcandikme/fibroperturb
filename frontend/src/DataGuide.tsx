import type {Language} from './geneInfo'

const content={
 TR:{eyebrow:'VERİYİ DOĞRU OKUMAK',title:'Burada neyi görüyoruz?',intro:'FibroPerturb’ün ilk demosu, Hs27 insan fibroblastlarında CRISPRa guide-yakalama verilerini keşfetmenizi sağlar. Gen ekspresyonu değişimini ölçtüğümüzü ya da öngördüğümüzü henüz iddia etmiyoruz.',items:[
 ['01 / CRISPRa','CRISPR aktivasyonu, bir hedef genin transkripsiyonunu artırmayı amaçlayan bir yöntemdir. Guide’ın hücrede tespit edilmesi, hedef genin kesin olarak aktive edildiği anlamına gelmez.'],
 ['02 / GUIDE SAYIMI','Guide-capture ölçümü, hücrede hangi guide dizilerinden kaç sayım yakalandığını gösterir. Baskın guide payı, en yüksek sayımlı guide’ın toplam guide sayımlarındaki oranıdır.'],
 ['03 / ADAY HÜCRE','Demo için baskın guide payı en az %80 ve en yüksek guide sayımı en az 10 olan hücreler filtrelendi. Bunlar görüntüleme ölçütleridir; deneysel olarak doğrulanmış hücre etiketleri değildir.'],
 ['04 / SIRADAKİ BİLİMSEL ADIM','Kontrol grupları ve perturbasyon atamaları doğrulandıktan sonra, uygun istatistiksel yöntemlerle gen ekspresyonu değişimleri değerlendirilebilir. O zamana kadar hücre animasyonu yalnızca öğretici bir temsildir.']
 ],source:'Veri kaynağı: Hs27 CRISPRa · IGVFDS2001NDKP. Bu sayfanın sayısal değerleri yerel analizden türetilmiş toplu özetlerdir.',status:'Durum: keşif amaçlı veri · doğrulanmış transkripsiyonel etki yok'},
 EN:{eyebrow:'READING THE DATA',title:'What are we actually seeing?',intro:'The first FibroPerturb demo explores CRISPRa guide-capture data from Hs27 human fibroblasts. We do not yet claim to measure or predict gene-expression changes.',items:[
 ['01 / CRISPRa','CRISPR activation aims to increase transcription of a target gene. Detecting a guide in a cell does not prove that its intended gene was successfully activated.'],
 ['02 / GUIDE COUNTS','Guide capture records the counts associated with individual guide sequences in a cell. Dominant-guide share is the fraction of total guide counts contributed by the leading guide.'],
 ['03 / CANDIDATE CELLS','For display, cells were filtered at ≥80% dominant-guide share and at least 10 counts from their leading guide. These are exploratory filters, not validated experimental assignments.'],
 ['04 / NEXT SCIENTIFIC STEP','Once perturbation labels and controls are validated, gene-expression changes can be evaluated with suitable statistical methods. Until then, the cell animation is educational only.']
 ],source:'Source: Hs27 CRISPRa · IGVFDS2001NDKP. Numerical values on this page are aggregated summaries derived from local analysis.',status:'Status: exploratory data · no validated transcriptional effect'}
}
export default function DataGuide({language}:{language:Language}){
 const t=content[language]
 return <section className="data-guide" id="method"><div className="data-guide-lead"><span className="eyebrow">04 / {t.eyebrow}</span><h2>{t.title}</h2><p>{t.intro}</p></div><div className="guide-grid">{t.items.map(([heading,text])=><article key={heading}><span>{heading}</span><p>{text}</p></article>)}</div><div className="guide-source"><span>{t.source}</span><span>{t.status}</span></div></section>
}
