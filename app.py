
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(
    page_title="FibroPerturb",
    page_icon="🧬",
    layout="wide",
)

@st.cache_data
def load_data():
    return pd.read_csv(
        "results/guide_dominance_summary.csv"
    )


df = load_data()

st.title("FibroPerturb")
st.caption(
    "Explore CRISPR activation experiments in human fibroblasts."
)

st.sidebar.header("Perturbation Explorer")

targets = sorted(
    df["top_target"].dropna().unique()
)

target = st.sidebar.selectbox(
    "Select a transcription factor",
    targets,
)

minimum_dominance = st.sidebar.slider(
    "Minimum guide dominance",
    min_value=0.0,
    max_value=1.0,
    value=0.8,
    step=0.05,
)

selected = df[
    (df["top_target"] == target)
    & (
        df["top_guide_fraction"]
        >= minimum_dominance
    )
].copy()

all_target_cells = df[
    df["top_target"] == target
]

st.subheader(f"{target} — Experimental overview")

col1, col2, col3 = st.columns(3)

col1.metric(
    "Candidate cells",
    f"{len(selected):,}",
)

col2.metric(
    "Median guide dominance",
    (
        f"{selected['top_guide_fraction'].median():.1%}"
        if len(selected)
        else "N/A"
    ),
)

col3.metric(
    "Total cells analyzed",
    f"{len(df):,}",
)

st.divider()

left, right = st.columns(2)

with left:
    st.subheader("Guide dominance")

    fig = px.histogram(
        all_target_cells,
        x="top_guide_fraction",
        nbins=40,
        labels={
            "top_guide_fraction": "Top-guide fraction"
        },
    )

    fig.update_layout(
        yaxis_title="Number of cells",
        showlegend=False,
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
    )

with right:
    st.subheader("Guide capture counts")

    fig = px.histogram(
        selected,
        x="top_guide_count",
        nbins=40,
        labels={
            "top_guide_count": "Top-guide capture count"
        },
    )

    fig.update_layout(
        yaxis_title="Number of cells",
        showlegend=False,
    )

    st.plotly_chart(
        fig,
        use_container_width=True,
    )

st.divider()

st.subheader("Experimental cell data")

st.dataframe(
    selected[
        [
            "barcode",
            "top_guide_id",
            "top_guide_count",
            "top_guide_fraction",
            "n_detected_guides",
        ]
    ].head(1000),
    use_container_width=True,
    hide_index=True,
)

st.caption(
    "Exploratory guide-capture analysis. "
    "Guide dominance does not establish successful "
    "perturbation or validated cell-level assignment."
)