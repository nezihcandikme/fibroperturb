
"""Export aggregated Hs27 guide-capture data for the web demo."""

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

INPUT = ROOT / "results/guide_dominance_summary.csv"

OUTPUT = ROOT / "frontend/public/demo-data/targets.json"


def main():
    if not INPUT.is_file():
        raise FileNotFoundError(
            f"Analysis file not found: {INPUT}"
        )

    df = pd.read_csv(
        INPUT,
        usecols=[
            "top_target",
            "top_guide_fraction",
            "top_guide_count",
            "top_guide_id",
        ],
    )

    # Exploratory filtering only.
    # These are NOT validated perturbation assignments.
    df = df[
        df["top_target"].notna()
        & (df["top_target"] != "")
        & (df["top_guide_fraction"] >= 0.80)
        & (df["top_guide_count"] >= 10)
    ].copy()

    print(f"Candidate cells: {len(df):,}")

    grouped = df.groupby("top_target", sort=True)

    summary = grouped.agg(
        candidate_cells=("top_target", "size"),
        median_dominance=("top_guide_fraction", "median"),
        median_guide_count=("top_guide_count", "median"),
        unique_top_guides=("top_guide_id", "nunique"),
    ).reset_index()

    # Keep targets with at least 20 candidate cells.
    # This is a display filter, not a biological QC threshold.
    summary = summary[
        summary["candidate_cells"] >= 20
    ]

    summary = summary.sort_values(
        "candidate_cells",
        ascending=False,
    )

    targets = []

    for row in summary.itertuples(index=False):
        targets.append(
            {
                "target": str(row.top_target),
                "candidate_cells": int(row.candidate_cells),
                "median_dominance": round(
                    float(row.median_dominance), 4
                ),
                "median_guide_count": float(
                    row.median_guide_count
                ),
                "unique_top_guides": int(
                    row.unique_top_guides
                ),
            }
        )

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    payload = {
        "dataset": "Hs27 CRISPRa",
        "analysis": "Exploratory guide-capture summary",
        "dominance_threshold": 0.80,
        "minimum_top_guide_count": 10,
        "minimum_candidate_cells_per_target": 20,
        "validated_assignments": False,
        "targets": targets,
    }

    OUTPUT.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(f"Exported targets: {len(targets):,}")
    print(f"Saved to: {OUTPUT}")

    print("\nFirst 10 targets:")

    for target in targets[:10]:
        print(
            f"{target['target']}: "
            f"{target['candidate_cells']:,} candidate cells"
        )


if __name__ == "__main__":
    main()