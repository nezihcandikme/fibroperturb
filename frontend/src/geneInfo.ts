export type Language = 'TR' | 'EN'
type GeneEntry = { name: string; tr: string; en: string; type: string }
const curated: Record<string, GeneEntry> = {
  AATF: { name: 'Apoptosis Antagonizing Transcription Factor', type: 'Transcriptional regulator', tr: 'AATF, gen ifadesinin düzenlenmesi ve hücresel stres yanıtıyla ilişkili bir proteini kodlar. Buradaki görsel, AATF aktivasyonunun ölçülmüş etkisini göstermez.', en: 'AATF encodes a protein involved in transcriptional regulation and cellular stress responses. The illustration does not depict a measured effect of AATF activation.' },
  SMAD3: { name: 'SMAD Family Member 3', type: 'Signal-responsive transcriptional regulator', tr: 'SMAD3, TGF-β sinyal yolundan gelen sinyallerin çekirdekte gen düzenlenmesine aktarılmasında rol alır.', en: 'SMAD3 helps convey TGF-β signaling to transcriptional regulation in the nucleus.' },
  ELK3: { name: 'ETS Transcription Factor ELK3', type: 'Transcription factor', tr: 'ELK3, DNA üzerindeki düzenleyici bölgelere bağlanarak gen ekspresyonunun kontrolüne katkıda bulunan bir ETS ailesi proteinini kodlar.', en: 'ELK3 encodes an ETS-family protein involved in regulating gene expression through DNA regulatory regions.' },
  FOXL2: { name: 'Forkhead Box L2', type: 'Transcription factor', tr: 'FOXL2, gelişim ve hücreye özgü gen düzenlenmesiyle ilişkili bir forkhead ailesi transkripsiyon faktörünü kodlar.', en: 'FOXL2 encodes a forkhead-family transcription factor involved in development and cell-specific gene regulation.' },
}
export function getGeneInfo(target: string, language: Language) {
  const entry = curated[target]
  if (!entry) return { name: target, type: null, description: null, curated: false }
  return { name: entry.name, type: entry.type, description: language === 'TR' ? entry.tr : entry.en, curated: true }
}
