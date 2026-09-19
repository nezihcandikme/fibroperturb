# FibroPerturb: evidence and delivery status

## What this package actually does

- React/Vite bilingual front-end with searchable Hs27 target summaries, two-target comparison, sortable/paginated target overview, and CSV export.
- Source data: the user's prior aggregated exploratory guide-capture export (`frontend/public/demo-data/targets.json`), **not** reconstructed or predicted transcriptional effects.
- The 3D fibroblast and transcription SVG are **illustrations**; changing target symbols does not change actual morphology, DNA binding or measured expression.
- Strict JSON schema guard (`frontend/src/dataModel.ts`), public data audit (`python scripts/audit_demo_json.py`), smoke tests (`node --test frontend/tests/*.test.mjs`).
- Optional LOCAL pilot analysis of paired RNA and guide features in 10x filtered feature-barcode CSC H5 (`scripts/pilot_expression.py`), which deliberately writes only to `results/` and is **not** shown on the public site.

## Local pilot (optional; use Mac with original Hs27 H5)

```bash
cd ~/Documents/fibroperturb
python -m pip install numpy h5py
python scripts/pilot_expression.py --h5 data/raw/hs27_filtered_feature_bc_matrix.h5 --targets SMAD3 AATF ELK3 FOXL2 --scan 30000 --max-per-group 40
```

This iterates through at most 30k cells, uses bounded memory and only scans up to 40 qualifying cells per group; HDF5 random-read speed varies. Sample is a **sequential prefix**, can be confounded by capture batch / barcode ordering; the most-abundant captured guide is NOT a validated biological perturbation label. The `non_targeting` control is a **candidate**, not a confirmed match for experimental conditions. CPM comparisons use pooled counts and a pseudocount. No replicates, cell-level QC, p-values, multiple testing correction or uncertainty; top log2 ratios are selected from thousands of features and are unsuitable for mechanistic claims.

Before promoting any expression results into the website: obtain experiment-level guide calls and assay metadata, verify intended library and non-targeting guides, identify batch and replicate annotations, perform ambient-guide/multiplet and RNA QC, compare guide-level consistency, select an appropriate replicate-aware DE method and validate against held-out perturbations. Only then export a *new, separately labeled* aggregate expression report with thresholds, sample sizes, provenance and limitations. No real unseen-perturbation prediction model is included here.

## Raw-data handling

`data/raw/`, `results/`, HDF5, cell barcodes, guide identities per cell and cell-level expression are not included in the deliverable. Do not upload them to GitHub or the site's `public/` folder. The existing `targets.json` holds only aggregated guide-capture summaries.

## Build status

The included JS and Python tests exercise data contracts and synthetic pilot input. Full React browser/TypeScript build still needs to run on the user's Mac with the installed npm dependencies: `cd frontend && npm run build && npm run dev`. No claim is made that the 3D result was visually inspected in a browser here.
