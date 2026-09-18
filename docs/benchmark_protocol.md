# Initial benchmark sketch

This is a starting sketch, not a locked analysis plan. We will revise it after inspecting the real matrix and after getting statistical feedback.

## The basic idea

For each transcription factor (TF) activation, we want to summarise how the population of fibroblasts changes compared with relevant control cells.

The eventual question is whether we can hide an entire TF from training and still make a useful prediction about its response.

## The important rule

We will never split random cells from the same perturbation across train and test. If a TF is in the test set, all cells carrying guides for that TF stay out of training.

Otherwise a model can look good simply because it has already seen essentially the same perturbation.

## First comparisons

Before any ambitious model, we will compare against:

1. **No-change:** assume the perturbation does nothing.
2. **Average training response:** use the average response from observed TFs.
3. **Nearest related TF:** transfer the response of a biologically similar TF.

Only if a simple, interpretable model beats these fairly should we consider more complex approaches.

## What success would mean

A positive result would mean that, on this specific public Hs27 dataset, a model captures some reproducible relationship between TF information and broad transcriptional shifts.

It would not show that the model works in patients, predicts drugs, works across tissues, or identifies a therapy.
