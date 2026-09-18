"""Group-level splits that prevent perturbation leakage."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass(frozen=True)
class PerturbationSplit:
    """Disjoint perturbation labels for train, validation, and test."""

    train: tuple[str, ...]
    validation: tuple[str, ...]
    test: tuple[str, ...]


def split_perturbations(
    perturbations: Iterable[str],
    test_fraction: float = 0.2,
    validation_fraction: float = 0.1,
    random_state: int = 0,
) -> PerturbationSplit:
    """Split unique perturbation labels, never individual cells, into three sets."""
    if not 0 < test_fraction < 1 or not 0 < validation_fraction < 1:
        raise ValueError("Fractions must be between zero and one.")
    if test_fraction + validation_fraction >= 1:
        raise ValueError("Test and validation fractions must leave a training set.")

    unique = sorted({str(value) for value in perturbations})
    if len(unique) < 3:
        raise ValueError("At least three unique perturbations are required.")

    n_test = max(1, round(len(unique) * test_fraction))
    n_validation = max(1, round(len(unique) * validation_fraction))
    if n_test + n_validation >= len(unique):
        raise ValueError("Fractions leave no perturbations for training.")

    shuffled = np.random.default_rng(random_state).permutation(unique).tolist()
    return PerturbationSplit(
        train=tuple(shuffled[n_test + n_validation :]),
        validation=tuple(shuffled[n_test : n_test + n_validation]),
        test=tuple(shuffled[:n_test]),
    )
