"""Minimum honest benchmark comparisons for held-out perturbations."""

from __future__ import annotations

import numpy as np

from fibroperturb.baselines import mean_response, no_change
from fibroperturb.metrics import PredictionSummary, summarize_predictions


def benchmark_simple_baselines(
    training_changes: np.ndarray, test_changes: np.ndarray
) -> dict[str, PredictionSummary]:
    """Evaluate the no-change and training-mean baselines on held-out responses."""
    train = np.asarray(training_changes, dtype=float)
    test = np.asarray(test_changes, dtype=float)
    if train.ndim != 2 or test.ndim != 2 or train.shape[1] != test.shape[1]:
        raise ValueError("Training and test changes must be two-dimensional with matching genes.")
    return {
        "no_change": summarize_predictions(test, no_change(*test.shape)),
        "mean_response": summarize_predictions(test, mean_response(train, n_samples=test.shape[0])),
    }
