
from pathlib import Path

import numpy as np
import pandas as pd


INPUT = Path("results/guide_capture_summary.csv")

OUTPUT = Path("results/guide_dominance_summary.csv")


def main():
    df = pd.read_csv(INPUT)

    # Fraction of all guide-capture counts belonging
    # to the highest-count guide.
    df["top_guide_fraction"] = np.where(
        df["total_guide_counts"] > 0,
        df["top_guide_count"]
        / df["total_guide_counts"].replace(0, np.nan),
        np.nan,
    )

    captured = df[df["total_guide_counts"] > 0].copy()

    print("\nGUIDE DOMINANCE DISTRIBUTION")

    print(
        captured["top_guide_fraction"].describe(
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

    print("\nEXPLORATORY DOMINANCE THRESHOLDS")

    for threshold in [0.50, 0.70, 0.80, 0.90, 0.95]:
        n = int(
            (
                captured["top_guide_fraction"]
                >= threshold
            ).sum()
        )

        percentage = 100 * n / len(captured)

        print(
            f"Top guide >= {threshold:.0%}: "
            f"{n:,} cells ({percentage:.2f}%)"
        )

    print("\nDOMINANCE BY GUIDE COUNT")

    captured["guide_count_group"] = pd.cut(
        captured["n_detected_guides"],
        bins=[0, 1, 2, 5, 10, 20, np.inf],
        labels=[
            "1",
            "2",
            "3-5",
            "6-10",
            "11-20",
            "21+",
        ],
    )

    print(
        captured.groupby(
            "guide_count_group",
            observed=True,
        )["top_guide_fraction"].agg(
            ["count", "median", "mean"]
        )
    )

    df.to_csv(OUTPUT, index=False)

    print(f"\nSaved: {OUTPUT}")


if __name__ == "__main__":
    main()