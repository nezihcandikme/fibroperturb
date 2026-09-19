
import { useState } from 'react'
import CellModel from './cell/CellModel'
import './App.css'
import PerturbationExplorer from './PerturbationExplorer'
import DataGuide from './DataGuide'

type Language = 'TR' | 'EN'

const translations = {
  TR: {
    research: 'Araştırma',
    explorer: 'Explorer',
    language: 'EN',
    intro: 'HÜCRESEL ARAŞTIRMA PLATFORMU',
    title: 'Genleri anlamak.',
    titleSecondary: 'Değişimi keşfetmek.',
    description:
      'Genetik müdahalelerin hücresel etkilerini keşfetmek için geliştirilen hesaplamalı araştırma platformu.',
    explore: 'Explorer’ı aç',
    learn: 'Platform hakkında',
    cellTitle: 'Bir hücrenin içinde.',
    cellDescription:
      'Hücreyi döndürün, yakınlaştırın ve hücresel yapıları inceleyin. Her yapı, hücrenin biyolojik işleyişinde farklı bir rol üstlenir.',
    scienceLabel: 'ARAŞTIRMA',
    scienceTitle: 'Gerçek verilerle başlayan bir araştırma.',
    scienceDescription:
      'FibroPerturb, insan fibroblast hücrelerinde gerçekleştirilen CRISPR aktivasyon deneylerinin verilerini kullanarak genetik müdahaleleri ve hücresel yanıtları incelemeyi amaçlar.',
    dataNote:
      'Hs27 veri setinin yapısal analizi tamamlandı. Hücre düzeyindeki perturbasyon atamalarının ve gen ekspresyonu etkilerinin doğrulanması devam ediyor.',
    futureLabel: 'FIBROPERTURB',
    futureTitle: 'Deneysel gözlemden hesaplamalı tahmine.',
    futureDescription:
      'İlk aşamada gerçek deneysel verileri keşfetmeye odaklanıyoruz. Uzun vadeli hedefimiz, araştırmacıların henüz test edilmemiş genetik müdahaleler için hesaplamalı hipotezler geliştirmesine yardımcı olmak.',
    footer: 'Hücresel keşif için geliştiriliyor.',
  },

  EN: {
    research: 'Research',
    explorer: 'Explorer',
    language: 'TR',
    intro: 'CELLULAR RESEARCH PLATFORM',
    title: 'Understand the genes.',
    titleSecondary: 'Explore what changes.',
    description:
      'A computational research platform for exploring the cellular effects of genetic perturbations.',
    explore: 'Open Explorer',
    learn: 'About the platform',
    cellTitle: 'Inside a cell.',
    cellDescription:
      'Rotate, zoom in, and explore cellular structures. Each structure plays a different role in the cell’s biological functions.',
    scienceLabel: 'RESEARCH',
    scienceTitle: 'Research grounded in real data.',
    scienceDescription:
      'FibroPerturb aims to investigate genetic perturbations and cellular responses using CRISPR activation data from human fibroblasts.',
    dataNote:
      'Structural analysis of the Hs27 dataset is complete. Cell-level perturbation assignments and gene-expression effects still require validation.',
    futureLabel: 'FIBROPERTURB',
    futureTitle: 'From experimental observations to computational predictions.',
    futureDescription:
      'Our first step is to explore real experimental data. Our long-term goal is to help researchers develop computational hypotheses for genetic perturbations that have not yet been tested.',
    footer: 'Building new tools for cellular discovery.',
  },
}

function App() {
  const [language, setLanguage] =
    useState<Language>('TR')

  const t = translations[language]

  return (
    <div className="app">
      <header className="site-header">
        <a href="#home" className="logo">
          FibroPerturb<span className="logo-period">.</span>
        </a>

        <nav className="site-navigation">
          <a href="#research">{t.research}</a>
          <a href="#explorer">{t.explorer}</a>

          <button
            type="button"
            className="language-switch"
            onClick={() =>
              setLanguage(
                language === 'TR' ? 'EN' : 'TR',
              )
            }
          >
            {t.language}
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <span className="eyebrow">
              {t.intro}
            </span>

            <h1>
              {t.title}
              <br />
              <span>{t.titleSecondary}</span>
            </h1>

            <p>{t.description}</p>

            <div className="hero-actions">
              <a
                className="primary-link"
                href="#explorer"
              >
                {t.explore}
                <span aria-hidden="true">↗</span>
              </a>

              <a
                className="text-link"
                href="#research"
              >
                {t.learn}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="hero-model">
            <CellModel language={language} />
          </div>
        </section>

        <PerturbationExplorer language={language} />
        <DataGuide language={language} />
        <section
          className="research-section"
          id="research"
        >
          <div className="research-inner">
            <span className="eyebrow">
              {t.scienceLabel}
            </span>

            <h2>{t.scienceTitle}</h2>

            <p className="research-description">
              {t.scienceDescription}
            </p>

            <div className="research-evidence">
              <span>Hs27 / CRISPRa</span>

              <p>{t.dataNote}</p>
            </div>
          </div>
        </section>

        <section className="vision-section">
          <span className="eyebrow">
            {t.futureLabel}
          </span>

          <h2>{t.futureTitle}</h2>

          <p>{t.futureDescription}</p>
        </section>
      </main>

      <footer className="site-footer">
        <span>FibroPerturb.</span>

        <span>{t.footer}</span>

        <span>2026</span>
      </footer>
    </div>
  )
}

export default App