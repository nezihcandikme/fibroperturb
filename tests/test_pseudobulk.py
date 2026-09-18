import numpy as np

from fibroperturb.pseudobulk import aggregate_counts, log2_cpm, perturbation_changes


def test_aggregate_counts_sums_cells_by_perturbation() -> None:
    counts = np.array([[1, 2], [3, 4], [10, 20], [30, 40]])
    labels = np.array(["control", "control", "TF1", "TF1"])

    result = aggregate_counts(counts, labels)

    assert result.groups == ("TF1", "control")
    np.testing.assert_array_equal(result.counts, np.array([[40, 60], [4, 6]]))


def test_perturbation_changes_subtracts_control_log_expression() -> None:
    counts = np.array([[60, 40], [4, 6]])
    groups = ("TF1", "control")

    changes = perturbation_changes(log2_cpm(counts), groups, control_group="control")

    assert changes.groups == ("TF1",)
    assert changes.values[0, 0] > 0
    assert changes.values[0, 1] < 0
