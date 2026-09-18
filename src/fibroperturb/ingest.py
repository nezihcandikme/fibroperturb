"""Read-only structural validation for a 10x cell-by-feature HDF5 matrix."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any



def file_md5(path: Path, chunk_size: int = 1024 * 1024) -> str:
    """Return the MD5 checksum without loading the file into memory."""
    digest = hashlib.md5(usedforsecurity=False)
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def summarize_feature_types(feature_types: list[str]) -> dict[str, int]:
    """Count feature types in a stable JSON-friendly form."""
    return dict(sorted(Counter(map(str, feature_types)).items()))


def inspect_10x_h5(matrix_path: Path) -> dict[str, Any]:
    """Read a 10x HDF5 matrix and return only structural metadata."""
    try:
        import scanpy as sc
    except ImportError as error:
        raise ImportError(
            "Reading a 10x HDF5 matrix requires the project dependencies. "
            "Install them with `pip install -e .[dev]`."
        ) from error

    adata = sc.read_10x_h5(matrix_path, gex_only=False)
    if "feature_types" not in adata.var.columns:
        raise ValueError("Missing `feature_types`; this is not the expected cell-by-gene-and-guide matrix.")

    counts = summarize_feature_types(adata.var["feature_types"].tolist())
    return {
        "matrix_path": str(matrix_path),
        "md5": file_md5(matrix_path),
        "n_cells": int(adata.n_obs),
        "n_features": int(adata.n_vars),
        "feature_type_counts": counts,
        "has_gene_expression": "Gene Expression" in counts,
        "has_crispr_guide_capture": "CRISPR Guide Capture" in counts,
        "obs_columns": sorted(map(str, adata.obs.columns)),
        "var_columns": sorted(map(str, adata.var.columns)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("matrix", type=Path, help="Path to filtered_feature_bc_matrix.h5")
    parser.add_argument("--output", type=Path, default=Path("results/data_inventory.json"))
    args = parser.parse_args()

    if not args.matrix.is_file():
        raise FileNotFoundError(f"Matrix not found: {args.matrix}")

    inventory = inspect_10x_h5(args.matrix)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(inventory, indent=2) + "\n")
    print(json.dumps(inventory, indent=2))


if __name__ == "__main__":
    main()
