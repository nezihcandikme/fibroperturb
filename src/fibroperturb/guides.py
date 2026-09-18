"""Conservative guide-assignment helpers for Perturb-seq matrices."""

from __future__ import annotations

from typing import Iterable

import numpy as np


def assign_single_guides(
    guide_counts: np.ndarray,
    guide_names: Iterable[str],
    min_count: int = 3,
    min_ratio: float = 2.0,
) -> np.ndarray:
    """Assign one guide only when its count clearly exceeds every alternative.

    Ambiguous or low-count cells are returned as ``None`` rather than forced
    into a perturbation group.
    """
    matrix = np.asarray(guide_counts)
    names = np.asarray(list(guide_names), dtype=object)
    if matrix.ndim != 2 or matrix.shape[1] != names.size:
        raise ValueError("Guide matrix columns must match the guide names.")
    if min_count < 1 or min_ratio <= 1:
        raise ValueError("min_count must be positive and min_ratio must exceed one.")

    assignment = np.full(matrix.shape[0], None, dtype=object)
    for index, row in enumerate(matrix):
        top_index = int(np.argmax(row))
        top_count = float(row[top_index])
        second_count = float(np.partition(row, -2)[-2]) if row.size > 1 else 0.0
        if second_count == 0:
            ratio = np.inf if top_count > 0 else 0.0
        else:
            ratio = top_count / second_count
        if top_count >= min_count and ratio >= min_ratio:
            assignment[index] = names[top_index]
    return assignment
