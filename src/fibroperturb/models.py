"""Small transparent predictive models for perturbation response benchmarks."""

from __future__ import annotations

import numpy as np
from sklearn.linear_model import Ridge


def ridge_response(
    training_features: np.ndarray,
    training_changes: np.ndarray,
    test_features: np.ndarray,
    alpha: float = 1.0,
) -> np.ndarray:
    """Fit multi-output ridge regression using pre-defined perturbation features.

    The function deliberately does not construct those features: their source
    must be documented before a biological benchmark is run.
    """
    x_train = np.asarray(training_features, dtype=float)
    y_train = np.asarray(training_changes, dtype=float)
    x_test = np.asarray(test_features, dtype=float)
    if x_train.ndim != 2 or x_test.ndim != 2 or y_train.ndim != 2:
        raise ValueError("Features and changes must be two-dimensional arrays.")
    if x_train.shape[0] != y_train.shape[0] or x_train.shape[1] != x_test.shape[1]:
        raise ValueError("Training rows and feature dimensions must match.")
    if alpha < 0:
        raise ValueError("alpha must be non-negative.")

    return Ridge(alpha=alpha).fit(x_train, y_train).predict(x_test)
