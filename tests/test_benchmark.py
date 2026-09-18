import numpy as np

from fibroperturb.benchmark import benchmark_simple_baselines


def test_simple_baseline_benchmark_reports_both_required_baselines() -> None:
    train = np.array([[1.0, -1.0], [3.0, -3.0]])
    test = np.array([[2.0, -2.0]])

    report = benchmark_simple_baselines(train, test)

    assert set(report) == {"no_change", "mean_response"}
    assert report["mean_response"].rmse == 0.0
