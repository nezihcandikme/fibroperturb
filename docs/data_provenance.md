# Data notes

## What we are downloading

For the first pass, we are using a public matrix from the Hs27 CRISPRa Perturb-seq experiment.

- **Analysis set:** `IGVFDS2001NDKP`
- **File:** `filtered_feature_bc_matrix.h5`
- **What it should contain:** filtered single cells, gene-expression features, and guide-capture features
- **Reference:** GRCh38 / GENCODE 32
- **Listed attribution:** Tom Norman, MSKCC / Christina Leslie

The file belongs locally in `data/raw/`; it is intentionally not uploaded to GitHub.

## Before we analyse anything

We need to answer a few basic questions from the actual file and its accompanying metadata:

- Are both gene expression and guide capture present?
- How are cells assigned to individual guides?
- Which guides correspond to non-targeting controls?
- Is there batch or lane information that matters for fair comparisons?
- Does the aggregate matrix include exactly the context we think it includes?

The first inspection script is meant to answer only the first question safely. The rest will be handled after we see the file.

## Keeping a record

Once we download it, we will save the source link, download date, checksum, and displayed license/terms in `results/data_inventory.json`.

Publicly downloadable data is not automatically cleared for every kind of commercial use. That matters later, if this ever moves beyond an open research project.
