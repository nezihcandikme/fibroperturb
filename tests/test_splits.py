import numpy as np

from fibroperturb.splits import split_perturbations


def test_split_perturbations_keeps_each_perturbation_in_one_partition() -> None:
    groups = np.array(["A", "A", "B", "B", "C", "C", "D", "D", "E", "E"])

    split = split_perturbations(groups, test_fraction=0.2, validation_fraction=0.2, random_state=7)

    partitions = [set(split.train), set(split.validation), set(split.test)]
    assert not partitions[0] & partitions[1]
    assert not partitions[0] & partitions[2]
    assert not partitions[1] & partitions[2]
    assert set().union(*partitions) == set(groups)


def test_split_perturbations_is_deterministic() -> None:
    groups = np.array(["A", "B", "C", "D", "E", "F"])

    first = split_perturbations(groups, random_state=42)
    second = split_perturbations(groups, random_state=42)

    assert first == second
