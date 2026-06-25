# Dataset Quality and Validation Report: NoiseCleaner Dataset MVP

This report evaluates the structural, annotation, content, and scientific validity of the merged and corrected **NoiseCleaner Dataset MVP** (`noisecleaner_dataset_mvp_fixed.json`). 

Following the standards of ACL/EMNLP dataset reviews, we evaluate the utility of this dataset for downstream classification tasks (specifically, segment classification using **MiniLM embeddings**, **Logistic Regression**, and **Linear SVM**).

---

## 1. Structural Validation

A comprehensive programmatic audit of the corpus was performed to verify data integrity:

*   **Article ID Uniqueness**: Verified. The raw V2 dataset contained duplicate keys (e.g., `ar_hespress_01` mapped to both Swiss voters and Court of Auditors articles; `en_aljazeera_01` mapped to both US-Iran peace deal and Japan vs Netherlands). All duplicate IDs have been resolved using a strict URL-based mapping and converted into sequential, unique IDs (`ar_hespress_04`, `ar_hespress_05`, `ar_aljazeera_03`, `en_aljazeera_04`–`08`).
*   **Length Consistency**: Verified. For all 24 articles, the number of segments matches the number of labels exactly (`len(segments) == len(labels)`).
*   **Empty Segments**: Checked. No empty or whitespace-only segments exist in the dataset.
*   **Duplicate Articles**: Resolved. URL duplication was detected for China-Morocco trade V1 vs V2, and Japan-Netherlands V1 vs V2. Programmatic comparison showed they contained slightly different segment text and extraction sequences (different variations of the same news reports). Thus, both variants were retained to increase training data diversity, labeled under unique IDs (`ar_hespress_02` / `ar_hespress_05` and `en_aljazeera_02` / `en_aljazeera_08`).
*   **JSON Validity**: Verified. The final output is formatted as a single JSON array of article objects containing only `article_id`, `segments`, and `labels`.

---

## 2. Annotation Validation

The consistency of segment labeling was verified across all articles:

*   **Mismatches / Contradictions**: Programmatic cross-referencing identified **6 segment text overlaps** that had conflicting labels across different articles:
    1.  `'Germany hit Curacao for seven to open their World Cup'` (Label `1` in its main article; `0` as recommended link in the footer of others).
    2.  `'Tomates, poivrons : pourquoi les prix baissent actuellement au Maroc'` (Label `1` in main article; `0` as recommended link).
    3.  `'Fécondité : le Maroc s’inscrit dans la tendance baissière qui redessine le Maghreb'` (Label `1` in main article; `0` as recommended link).
    4.  `'Boom de l’électrique : la recomposition mondiale profite au Maroc'` (Label `1` in main article; `0` as recommended link).
    5.  `'جدل "سعر المقهى" يتجدد في العيون'` (Label `1` in main article; `0` as recommended link).
    6.  `'Japan deny Netherlands by fighting back twice in World Cup opener'` (Label `1` in main article; `0` as recommended link).
    
    *Audit Assessment*: These conflicts are **contextually valid**. A segment is correctly labeled as `1` (editorial) when it is the main title of the active article, but correctly labeled as `0` (noise) when it serves as a recommended link in the boilerplate of another page. No actual annotation errors were found.

---

## 3. Content Validation

*   **Segment Length Distribution**: High quality. The average length of editorial segments is 144 characters. Only 1 editorial segment is under 40 characters (`'جدل "سعر المقهى" يتجدد في العيون'`, which is a valid short title). Short noise segments like `'MENU'`, `'SPORT'`, or `'الرئيسية'` are properly annotated as noise (`0`).
*   **Unannotated Noise**: Boilerplate text (menus, search boxes, footer links, tags, and newsletter promos) are correctly and consistently annotated as noise (`0`).
*   **Main Content Coverage**: The main paragraphs of the articles are preserved in their original sequence and annotated as editorial (`1`).

---

## 4. Scientific Validation & Model Readiness

For training a pipeline of **MiniLM embeddings** $\rightarrow$ **Logistic Regression / SVM**, we highlight the following characteristics:

### A. Class Imbalance
*   **Total Segments**: 571
*   **Editorial (1)**: 170 segments (29.77%)
*   **Noise (0)**: 401 segments (70.23%)
*   *Evaluation*: The dataset exhibits a 70:30 noise-to-editorial imbalance. This is representative of web pages where boilerplate outweighs actual text. Standard regularization or class weight balancing (e.g., `class_weight='balanced'` in scikit-learn) is recommended during training.

### B. Language Distribution
*   **French**: 8 articles, 226 segments
*   **Arabic**: 8 articles, 200 segments
*   **English**: 8 articles, 145 segments
*   *Evaluation*: The dataset is perfectly balanced at the *article level* (8 articles per language). However, French articles contain longer texts, causing a slight segment-level bias towards French. MiniLM (being multilingual) will generalize across these languages, but users should evaluate performance per language.

### C. Data Leakage and Evaluation Split
> [!IMPORTANT]
> **Data Leakage Risk**: Because titles of articles appear as recommended links (noise segments) in other articles, a random split at the *segment level* will cause massive data leakage (the model will see the exact same sentence in both train and test sets).
> 
> **Recommendation**: Researchers **MUST** split train/validation/test sets at the **article level** (group splitting by `article_id`), ensuring that no segments from the same article (or different variants of the same article) span across splits.

### D. Overfitting Risk
Given the small size of the dataset (571 segments), deep neural networks will easily overfit. The proposed linear baseline (MiniLM embeddings $\rightarrow$ SVM/Logistic Regression) is highly appropriate here as it leverages pretrained multilingual semantic representations with a low-capacity linear classifier.
