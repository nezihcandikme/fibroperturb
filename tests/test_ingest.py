from fibroperturb.ingest import summarize_feature_types


def test_summarize_feature_types_counts_gene_and_guides() -> None:
    observed = ["Gene Expression", "CRISPR Guide Capture", "Gene Expression"]
    assert summarize_feature_types(observed) == {
        "CRISPR Guide Capture": 1,
        "Gene Expression": 2,
    }
