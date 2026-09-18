import numpy as np

from fibroperturb.guides import assign_single_guides


def test_assign_single_guides_keeps_cells_with_one_clear_guide() -> None:
    guide_counts = np.array([[8, 0, 0], [1, 6, 0], [4, 4, 0], [0, 0, 0]])

    assigned = assign_single_guides(guide_counts, ["gA", "gB", "gC"], min_count=3, min_ratio=2.0)

    assert assigned.tolist() == ["gA", "gB", None, None]
