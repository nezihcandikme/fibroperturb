# Data provenance and handling

## V1 matrix

- Analysis set: `IGVFDS2001NDKP`
- Description: CRISPRa Perturb-seq targeting human transcription-factor genes/TSSs in Hs27 fibroblasts
- Downloaded file: `filtered_feature_bc_matrix.h5`
- Expected content: filtered cell-by-gene-and-guide matrix
- Genome/reference: GRCh38 / GENCODE 32
- Attribution: Tom Norman, MSKCC / Christina Leslie (as listed in IGVF)

The downloaded file must be accompanied by its source URL, download date, MD5 checksum, and displayed license/terms in `results/data_inventory.json` before any public model release.

## Non-negotiable checks

1. Confirm the matrix contains both Gene Expression and CRISPR Guide Capture feature types.
2. Determine how singlet guide assignments and non-targeting controls are encoded.
3. Determine batch/lane/sample information required for matched-control comparisons.
4. Do not claim the aggregate matrix contains only one biological context until metadata verifies it.

Public availability is not automatically commercial permission. Data licensing must be checked on the source record before product use.
