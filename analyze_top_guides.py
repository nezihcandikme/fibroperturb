
from pathlib import Path

import h5py
import numpy as np
import pandas as pd


MATRIX_PATH = Path(
    "data/raw/hs27_filtered_feature_bc_matrix.h5"
)

OUTPUT_PATH = Path(
    "results/top_guide_analysis.csv"
)

BATCH_SIZE = 2000


def decode(values):
    return [
        value.decode("utf-8")
        if isinstance(value, bytes)
        else str(value)
        for value in values
    ]


def main():
    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with h5py.File(MATRIX_PATH, "r") as f:
        matrix = f["matrix"]
        features = matrix["features"]

        feature_types = np.asarray(
            decode(features["feature_type"][:])
        )

        all_targets = np.asarray(
            decode(features["name"][:])
        )

        all_ids = np.asarray(
            decode(features["id"][:])
        )

        guide_mask = (
            feature_types == "CRISPR Guide Capture"
        )

        barcodes = decode(matrix["barcodes"][:])

        indptr = matrix["indptr"]
        indices = matrix["indices"]
        data = matrix["data"]

        n_cells = len(barcodes)

        results = []

        for batch_start in range(
            0, n_cells, BATCH_SIZE
        ):
            batch_end = min(
                batch_start + BATCH_SIZE,
                n_cells,
            )

            offsets = indptr[
                batch_start:batch_end + 1
            ]

            start = int(offsets[0])
            end = int(offsets[-1])

            batch_indices = indices[start:end]
            batch_data = data[start:end]

            for local_cell, barcode in enumerate(
                barcodes[batch_start:batch_end]
            ):
                row_start = (
                    int(offsets[local_cell]) - start
                )

                row_end = (
                    int(offsets[local_cell + 1]) - start
                )

                row_indices = batch_indices[
                    row_start:row_end
                ]

                row_data = batch_data[
                    row_start:row_end
                ]

                selected = guide_mask[row_indices]

                guide_indices = row_indices[selected]
                guide_counts = row_data[selected]

                if len(guide_counts) == 0:
                    results.append(
                        {
                            "barcode": barcode,
                            "top_guide": "",
                            "top_target": "",
                            "top_count": 0,
                            "second_guide": "",
                            "second_target": "",
                            "second_count": 0,
                            "n_distinct_targets": 0,
                            "top_two_same_target": False,
                        }
                    )
                    continue

                order = np.argsort(
                    guide_counts
                )[::-1]

                top = order[0]

                top_count = int(
                    guide_counts[top]
                )

                top_target = all_targets[
                    guide_indices[top]
                ]

                top_guide = all_ids[
                    guide_indices[top]
                ]

                second_count = 0
                second_target = ""
                second_guide = ""

                if len(order) > 1:
                    second = order[1]

                    second_count = int(
                        guide_counts[second]
                    )

                    second_target = all_targets[
                        guide_indices[second]
                    ]

                    second_guide = all_ids[
                        guide_indices[second]
                    ]

                results.append(
                    {
                        "barcode": barcode,
                        "top_guide": top_guide,
                        "top_target": top_target,
                        "top_count": top_count,
                        "second_guide": second_guide,
                        "second_target": second_target,
                        "second_count": second_count,
                        "n_distinct_targets": len(
                            set(
                                all_targets[
                                    guide_indices
                                ]
                            )
                        ),
                        "top_two_same_target": (
                            second_count > 0
                            and top_target == second_target
                        ),
                    }
                )

            print(
                f"Processed {batch_end:,}"
                f" / {n_cells:,} cells",
                end="\r",
                flush=True,
            )

    df = pd.DataFrame(results)

    df["second_to_top_ratio"] = np.where(
        df["top_count"] > 0,
        df["second_count"]
        / df["top_count"].replace(0, np.nan),
        np.nan,
    )

    df.to_csv(
        OUTPUT_PATH,
        index=False,
    )

    captured = df[
        df["top_count"] > 0
    ]

    print("\n\nSECOND-TO-TOP GUIDE RATIO")

    print(
        captured[
            "second_to_top_ratio"
        ].describe(
            percentiles=[
                0.10,
                0.25,
                0.50,
                0.75,
                0.90,
                0.95,
                0.99,
            ]
        )
    )

    print("\nTOP TWO GUIDES TARGET SAME GENE")

    multiple = df[
        df["second_count"] > 0
    ]

    print(
        multiple[
            "top_two_same_target"
        ].value_counts()
    )

    print("\nNUMBER OF DISTINCT TARGETS")

    print(
        df[
            "n_distinct_targets"
        ].describe(
            percentiles=[
                0.25,
                0.50,
                0.75,
                0.90,
                0.99,
            ]
        )
    )

    print(
        "\nSaved:",
        OUTPUT_PATH,
    )


if __name__ == "__main__":
    main()