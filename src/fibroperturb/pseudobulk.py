"""Pseudobulk expression calculations independent of a file format."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass(frozen=True)
class GroupedExpression:
    """Expression values ordered by their corresponding group labels."""

    groups: tuple[str, ...]
    values: np.ndarray


@dataclass(frozen=True)
class PseudobulkCounts:
    """Summed count matrix ordered by perturbation group."""

    groups: tuple[str, ...]
    counts: np.ndarray


def aggregate_counts(counts: np.ndarray, labels: Iterable[str]) -> PseudobulkCounts:
    """Sum a cell-by-gene count matrix for each perturbation label."""
    matrix = np.asarray(counts)
    label_array = np.asarray(list(labels), dtype=str)
    if matrix.ndim != 2:
        raise ValueError("Counts must be a two-dimensional cell-by-gene matrix.")
    if matrix.shape[0] != label_array.size:
        raise ValueError("Counts and labels must have the same number of cells.")

    groups = tuple(sorted(set(label_array.tolist())))
    summed = np.vstack([matrix[label_array == group].sum(axis=0) for group in groups])
    return PseudobulkCounts(groups=groups, counts=summed)


def log2_cpm(counts: np.ndarray, pseudocount: float = 1.0) -> np.ndarray:
    """Compute log2 counts-per-million separately for each pseudobulk sample."""
    matrix = np.asarray(counts, dtype=float)
    if matrix.ndim != 2 or np.any(matrix < 0):
        raise ValueError("Counts must be a non-negative two-dimensional matrix.")
    library_sizes = matrix.sum(axis=1, keepdims=True)
    if np.any(library_sizes == 0):
        raise ValueError("Each pseudobulk sample must have a positive library size.")
    return np.log2(matrix / library_sizes * 1_000_000 + pseudocount)


def perturbation_changes(
    expression: np.ndarray, groups: Iterable[str], control_group: str
) -> GroupedExpression:
    """Return each non-control group's expression change relative to one control."""
    matrix = np.asarray(expression, dtype=float)
    labels = tuple(map(str, groups))
    if matrix.ndim != 2 or matrix.shape[0] != len(labels):
        raise ValueError("Expression rows and group labels must match.")
    if labels.count(control_group) != 1:
        raise ValueError("Exactly one pseudobulk control group is required.")
    control = matrix[labels.index(control_group)]
    selected = [index for index, group in enumerate(labels) if group != control_group]
    return GroupedExpression(
        groups=tuple(labels[index] for index in selected), values=matrix[selected] - control
    )
