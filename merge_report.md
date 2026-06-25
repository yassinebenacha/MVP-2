# Dataset Merge and Enrichment Report

This report documents the merge operations, statistics, and corrections performed to combine `noisecleaner_dataset_mvp.json` (V1) and `noisecleaner_dataset_v2_mvp.json` (V2) into the unified, production-ready `noisecleaner_dataset_mvp_fixed.json` dataset.

---

## 1. Summary Statistics

| Metric | Before Merge (V1 MVP) | After Merge (Fixed MVP) | Change / Delta |
| :--- | :---: | :---: | :---: |
| **Total Articles** | 9 | 24 | +15 |
| **Total Segments** | 254 | 571 | +317 |
| **Editorial Segments** | 73 | 170 | +97 |
| **Noise Segments** | 181 | 401 | +220 |

---

## 2. Duplicate IDs and Resolution

The raw V2 dataset contained duplicate keys due to inconsistent manual naming. We resolved these duplicates using strict URL-based mapping:

1.  **ar_hespress_01**:
    *   *Article A* (Swiss voters reject migration limits) $\rightarrow$ Retained as `ar_hespress_01`.
    *   *Article B* (Court of Auditors auditing deals) $\rightarrow$ Assigned unique ID `ar_hespress_04`.
2.  **ar_hespress_02**:
    *   *Article A* (China-Morocco trade deal - version 1) $\rightarrow$ Retained as `ar_hespress_02`.
    *   *Article B* (China-Morocco trade deal - version 2) $\rightarrow$ Assigned unique ID `ar_hespress_05`.
3.  **ar_aljazeera_01**:
    *   *Article A* (Opta World Cup predictions) $\rightarrow$ Retained as `ar_aljazeera_01`.
    *   *Article B* (US-Iran agreement keys) $\rightarrow$ Assigned unique ID `ar_aljazeera_03`.
4.  **en_aljazeera_01**:
    *   *Article A* (US-Iran peace deal) $\rightarrow$ Retained as `en_aljazeera_01`.
    *   *Article B* (Japan vs Netherlands - version 2) $\rightarrow$ Assigned unique ID `en_aljazeera_08`.
5.  **en_aljazeera_02**:
    *   *Article A* (Japan vs Netherlands - version 1) $\rightarrow$ Retained as `en_aljazeera_02`.
    *   *Article B* (Germany hit Curacao) $\rightarrow$ Assigned unique ID `en_aljazeera_04`.
6.  **en_aljazeera_03**:
    *   *Article A* (Protests G7 Evian) $\rightarrow$ Retained as `en_aljazeera_03`.
    *   *Article B* (Israel expands military control) $\rightarrow$ Assigned unique ID `en_aljazeera_05`.

---

## 3. Segment Additions and Deletions

### A. Segments Added (+341 raw segments)
*   **Enriched Titles (+9 segments)**: For the 9 original V1 articles, the V2 dataset contained the **article title** as the first segment, labeled as editorial (`1`). These have been successfully prepended to the 9 original articles.
*   **New Content (+332 segments)**: Added segments from the 15 new articles (5 French, 5 Arabic, 5 English) included in the V2 dataset.

### B. Segments Deleted (-24 segments)
*   **ID Markers (-24 segments)**: In the raw V2 format, metadata ID strings (e.g., `"ID: fr_le360_01"`) were embedded directly in the text list. These markers are artificial noise and have been programmatically deleted from the segments of all 24 articles.

---

## 4. Label Corrections & Standardizations

*   **Binary Resolution**: String labels `"editorial"` and `"noise"` from the raw V2 dataset have been converted into strict binary labels (`1` and `0` respectively) to conform to the MVP schema.
*   **Overlap Validation**: Segment labels were compared across matching segments in different contexts. Overlapping titles that appeared as recommended links in other pages were verified to be correctly labeled: `1` (editorial) in their native articles and `0` (noise) in recommended lists. No manual adjustments were needed as annotations were highly consistent.

---

## 5. Remaining Challenges

*   **Multilingual Embeddings**: The model pipeline must handle three languages (French, Arabic, English). A multilingual transformer like `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` is required to ensure feature representation alignment across languages.
*   **Segment Duplication**: Common navigation links (e.g. `'POLITIQUE'`, `'سياسة'`) appear multiple times within the same article. Since this represents natural web layouts, they are kept. The model will learn to classify these as noise based on their semantic representations.
