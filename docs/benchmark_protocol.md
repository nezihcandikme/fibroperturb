# V1 benchmark protocol

## Unit of prediction

The model predicts a perturbation-level response, not an individual cell. For each valid TF perturbation, expression is aggregated over eligible singlet cells and compared with matched non-targeting controls.

## Evaluation rule

Train, validation, and test partitions are groups of **TF targets**. A held-out TF, all of its guides, and every cell carrying those guides remain outside model fitting and preprocessing choices.

## Required baselines

1. No change.
2. Mean response of training TFs.
3. Functional nearest-neighbour response transfer.

The initial candidate model is multi-output ridge regression on pre-perturbation biological annotations. A deep model is not justified unless it is compared under the same split against these baselines.

## Stop rule

If a model does not robustly outperform the baselines across grouped TF splits, report that result; do not reinterpret it as evidence of a therapeutic or causal effect.
