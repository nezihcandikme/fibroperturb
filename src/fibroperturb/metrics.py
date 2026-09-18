"""Prediction metrics for perturbation-level expression changes."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class PredictionSummary:
    rmse: float
    mae: float
    pearson: float
    direction_accuracy: float


def summarize_predictions(observed: np.ndarray, predicted: np.ndarray) -> PredictionSummary:
    """Summarize held-out predictions across every perturbation-gene value."""
    actual = np.asarray(observed, dtype=float)
    estimate = np.asarray(predicted, dtype=float)
    if actual.shape != estimate.shape:
        raise ValueError("Observed and predicted arrays must have the same shape.")
    if actual.ndim != 2 or actual.size == 0:
        raise ValueError("Observed and predicted arrays must be non-empty two-dimensional matrices.")

    error = estimate - actual
    actual_flat = actual.ravel()
    estimate_flat = estimate.ravel()
    if np.std(actual_flat) == 0 or np.std(estimate_flat) == 0:
        correlation = float("nan")
    else:
        correlation = float(np.corrcoef(actual_flat, estimate_flat)[0, 1])
    return PredictionSummary(
        rmse=float(np.sqrt(np.mean(error**2))),
        mae=float(np.mean(np.abs(error))),
        pearson=correlation,
        direction_accuracy=float(np.mean(np.sign(actual) == np.sign(estimate))),
    )
