
from pathlib import Path

import h5py
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix


MATRIX_PATH = Path(
    "data/raw/hs27_filtered_feature_bc_matrix.h5"
)

OUTPUT_DIR = Path("results")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def decode(values):
    return [
        value.decode("utf-8")
        if isinstance(value, bytes)
        else str(value)
        for value in values
    ]


with h5py.File(MATRIX_PATH, "r") as f:
    matrix = f["matrix"]
    features = matrix["features"]

    feature_types = np.asarray(
        decode(features["feature_type"][:])
    )

    guide_indices = np.flatnonzero(
        feature_types == "CRISPR Guide Capture"
    )

    guide_ids = np.asarray(
        decode(features["id"][:])
    )[guide_indices]

    guide_targets = np.asarray(
        decode(features["name"][:])
    )[guide_indices]

    barcodes = decode(matrix["barcodes"][:])

    print("Loading sparse matrix...")

    shape = tuple(matrix["shape"][:])

    # 10x stores the matrix as features x cells in CSC format.
    # The same underlying arrays represent cells x features in CSR.
    counts = csr_matrix(
        (
            matrix["data"][:],
            matrix["indices"][:],
            matrix["indptr"][:],
        ),
        shape=(shape[1], shape[0]),
    )

    print("Extracting guide counts...")

    guides = counts[:, guide_indices].tocsr()

    del counts

    # Number of distinct guides detected in each cell.
    detected_guides = np.diff(guides.indptr)

    # Total guide-capture counts per cell.
    total_counts = np.asarray(
        guides.sum(axis=1)
    ).ravel()

    # Identify the guide with the highest count.
    # This is a candidate assignment, not a validated label.
    top_guide_index = np.full(
        guides.shape[0], -1, dtype=np.int32
    )

    top_guide_count = np.zeros(
        guides.shape[0], dtype=np.int64
    )

    for cell in range(guides.shape[0]):
        start = guides.indptr[cell]
        end = guides.indptr[cell + 1]

        if start == end:
            continue

        cell_counts = guides.data[start:end]

        best = np.argmax(cell_counts)

        top_guide_index[cell] = guides.indices[
            start + best
        ]

        top_guide_count[cell] = cell_counts[best]

    assigned = top_guide_index >= 0

    top_guide_ids = np.full(
        guides.shape[0], "", dtype=object
    )

    top_targets = np.full(
        guides.shape[0], "", dtype=object
    )

    top_guide_ids[assigned] = guide_ids[
        top_guide_index[assigned]
    ]

    top_targets[assigned] = guide_targets[
        top_guide_index[assigned]
    ]

    summary = pd.DataFrame(
        {
            "barcode": barcodes,
            "n_detected_guides": detected_guides,
            "total_guide_counts": total_counts,
            "top_guide_id": top_guide_ids,
            "top_target": top_targets,
            "top_guide_count": top_guide_count,
        }
    )

    output = OUTPUT_DIR / "guide_capture_summary.csv"

    summary.to_csv(output, index=False)

    print("\nGUIDE CAPTURE SUMMARY")

    print("Total cells:", len(summary))

    print(
        "Cells with no captured guides:",
        int((detected_guides == 0).sum()),
    )

    print(
        "Cells with exactly one detected guide:",
        int((detected_guides == 1).sum()),
    )

    print(
        "Cells with multiple detected guides:",
        int((detected_guides > 1).sum()),
    )

    print("\nDetected guides per cell:")

    print(
        summary["n_detected_guides"].describe(
            percentiles=[0.25, 0.5, 0.75, 0.9, 0.99]
        )
    )

    print("\nTotal guide counts per cell:")

    print(
        summary["total_guide_counts"].describe(
            percentiles=[0.25, 0.5, 0.75, 0.9, 0.99]
        )
    )

    print("\nMost common candidate targets:")

    print(
        summary.loc[assigned, "top_target"]
        .value_counts()
        .head(20)
    )

    print(f"\nSaved summary to: {output}")