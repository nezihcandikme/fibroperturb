import numpy as np

from fibroperturb.baselines import mean_response, no_change


def test_no_change_returns_zero_expression_changes() -> None:
    np.testing.assert_array_equal(no_change(n_samples=2, n_genes=3), np.zeros((2, 3)))


def test_mean_response_repeats_training_mean_for_every_test_perturbation() -> None:
    train = np.array([[1.0, 3.0], [3.0, 5.0]])

    prediction = mean_response(train, n_samples=3)

    np.testing.assert_array_equal(prediction, np.array([[2.0, 4.0]] * 3))
