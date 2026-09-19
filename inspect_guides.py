
import h5py

path = "data/raw/hs27_filtered_feature_bc_matrix.h5"


def decode(value):
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return str(value)


with h5py.File(path, "r") as f:
    matrix = f["matrix"]
    features = matrix["features"]

    print("MATRIX STRUCTURE")

    for name in matrix:
        item = matrix[name]
        print(name, item.shape if hasattr(item, "shape") else "group")

    print("\nFEATURE METADATA")

    for name in features:
        item = features[name]
        print(name, item.shape if hasattr(item, "shape") else "group")

    feature_types = features["feature_type"][:]

    guide_indices = [
        i for i, value in enumerate(feature_types)
        if decode(value) == "CRISPR Guide Capture"
    ]

    print("\nFIRST 10 GUIDE FEATURES")

    for i in guide_indices[:10]:
        print(f"\nFeature index: {i}")

        for field in ["id", "name", "pattern", "read", "sequence"]:
            if field in features:
                print(f"{field}: {decode(features[field][i])}")

    print("\nFIRST 5 GENE FEATURES")

    gene_indices = [
        i for i, value in enumerate(feature_types)
        if decode(value) == "Gene Expression"
    ]

    for i in gene_indices[:5]:
        print(
            decode(features["id"][i]),
            decode(features["name"][i])
        )