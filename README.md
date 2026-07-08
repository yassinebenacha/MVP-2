# NOISECLEANER

Academic NLP cleaning prototype developed during an engineering internship at Harmony Technology within CEIRA (Centre d'Excellence en Innovation et Recherche Appliquée).

## Pipeline

Raw text is segmented into paragraph-level units, encoded with `SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")`, classified with a trained Linear SVM or Logistic Regression model, filtered to remove noise segments, and reconstructed as clean text.

## Run Locally

1. Install dependencies:
   `npm install`
2. Start the application:
   `npm run dev`
