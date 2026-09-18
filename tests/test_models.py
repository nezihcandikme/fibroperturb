import numpy as np

from fibroperturb.models import ridge_response


def test_ridge_response_returns_one_prediction_per_unseen_perturbation() -> None:
    train_features = np.array([[0.0], [1.0], [2.0], [3.0]])
    train_changes = np.array([[0.0, 0.0], [1.0, -1.0], [2.0, -2.0], [3.0, -3.0]])

    prediction = ridge_response(train_features, train_changes, np.array([[4.0]]), alpha=0.01)

    assert prediction.shape == (1, 2)
    np.testing.assert_allclose(prediction, np.array([[4.0, -4.0]]), atol=0.05)
