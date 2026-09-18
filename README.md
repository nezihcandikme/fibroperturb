# FibroPerturb

> **Very early / starting version.** This repository is where we are learning whether a small, careful computational model can say anything useful about fibroblast perturbation data.

Fibrosis research is difficult partly because fibroblasts can move between many transcriptional states. Our long-term interest is whether computational tools could help researchers prioritize experiments around these state changes.

For now, we are deliberately asking a much smaller question:

> If we hide a transcription-factor activation from a model, can it predict the direction of that fibroblast's response any better than simple guesses?

If the answer is no, that is still useful to know. This first version is a benchmark, not a claim that we have built a virtual cell, found a treatment, or discovered a mechanism.

## What is in this first version?

- A public Hs27 fibroblast CRISPRa Perturb-seq dataset
- A reproducible way to inspect and document the matrix
- A plan to compare any future model against simple baselines
- Notes on avoiding easy but misleading evaluation mistakes

It is mostly setup at the moment. The data has not yet been analysed and no performance claim should be inferred from this repository.

## Dataset

We are starting with the filtered cell-by-gene-and-guide matrix from the Hs27 CRISPRa Perturb-seq analysis set: [IGVFDS2001NDKP](https://data.igvf.org/analysis-sets/IGVFDS2001NDKP/).

The experiment activates transcription factors in Hs27 human fibroblasts and measures RNA expression at single-cell resolution. The matrix is about 2 GB and is not stored in this repository.

When downloaded, place it here:

```text
data/raw/hs27_filtered_feature_bc_matrix.h5
```

## What we will do next

1. Check that the matrix contains the expected gene-expression and guide-capture information.
2. Work out exactly how guide assignments and controls are represented.
3. Build a tiny, transparent baseline before trying anything more complicated.
4. Evaluate by hiding *whole TF perturbations*, not random cells.
5. Only then decide whether a larger model is justified.

## Setup

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev,app]'
pytest
```

When the data is available:

```bash
fibroperturb-inspect data/raw/hs27_filtered_feature_bc_matrix.h5
```

This first command only inventories the file. It does not transform the data or fit a model.

## Boundaries

This project does not make drug, dose, diagnosis, or treatment recommendations. Any later predictions will be described as hypotheses for researchers to examine, not biological facts.

## People

Built as an early student-led computational biology project. We are looking for critique on the data pipeline, evaluation design, and what would make a result genuinely useful to a fibroblast researcher.

See [data notes](docs/data_provenance.md) and [the initial benchmark sketch](docs/benchmark_protocol.md).
