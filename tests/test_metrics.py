import numpy as np
import pytest

from fibroperturb.metrics import summarize_predictions


def test_prediction_summary_reports_perfect_predictions() -> None:
    observed = np.array([[1.0, -1.0], [2.0, -2.0]])

    result = summarize_predictions(observed, observed.copy())

    assert result.rmse == 0.0
    assert result.mae == 0.0
    assert result.direction_accuracy == 1.0
    assert result.pearson == 1.0


def test_prediction_summary_rejects_mismatched_shapes() -> None:
    with pytest.raises(ValueError, match="same shape"):
        summarize_predictions(np.zeros((2, 2)), np.zeros((2, 3)))
