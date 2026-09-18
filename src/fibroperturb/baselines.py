"""Simple benchmark baselines that every later model must beat."""

from __future__ import annotations

import numpy as np


def no_change(n_samples: int, n_genes: int) -> np.ndarray:
    """Predict no expression change for every held-out perturbation."""
    return np.zeros((n_samples, n_genes), dtype=float)


def mean_response(training_changes: np.ndarray, n_samples: int) -> np.ndarray:
    """Predict the mean observed training response for every held-out perturbation."""
    values = np.asarray(training_changes, dtype=float)
    if values.ndim != 2 or values.shape[0] == 0:
        raise ValueError("Training changes must be a non-empty two-dimensional matrix.")
    return np.repeat(values.mean(axis=0, keepdims=True), n_samples, axis=0)
