# FibroPerturb

An open, reproducible benchmark for a narrow question:

> Can biologically informed models predict the transcriptional-program response to an unseen transcription-factor activation in Hs27 human fibroblasts better than simple baselines?

## Scientific scope

This is a research proof of concept, not a therapeutic recommendation engine. It uses only public data and reports predicted state shifts as hypotheses. V1 supports CRISPRa activation of transcription factors present in the benchmark dataset only; it does not predict drugs, dosage, clinical outcomes, arbitrary genes, or cross-tissue responses.

## Data

The V1 source matrix is the **filtered cell-by-gene-and-guide HDF5 matrix** from the Hs27 CRISPRa Perturb-seq analysis set ([IGVFDS2001NDKP](https://data.igvf.org/analysis-sets/IGVFDS2001NDKP/)).

Save it locally as:

```text
data/raw/hs27_filtered_feature_bc_matrix.h5
```

It is deliberately ignored by Git. Do not commit downloaded matrices or raw sequencing data.

## Setup

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev,app]'
pytest
```

## First command after the matrix downloads

```bash
fibroperturb-inspect data/raw/hs27_filtered_feature_bc_matrix.h5
```

This performs a read-only structural check and writes `results/data_inventory.json`. It does **not** filter cells, fit a model, or make biological claims.

## Guardrails

- All future evaluation splits are grouped by perturbed TF, never by individual cell.
- Control/guide identity must be verified from metadata before modeling.
- The directly activated TF is excluded from downstream gene-level evaluation.
- Baselines are mandatory: no-change, training mean, and functional nearest neighbour.

See [docs/benchmark_protocol.md](docs/benchmark_protocol.md) and [docs/data_provenance.md](docs/data_provenance.md).
