import os
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np

# Constrain PyTorch to minimal threads before any torch import occurs.
# This prevents torch from pre-allocating thread pools that consume ~50 MB each.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("TORCH_NUM_THREADS", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

app = FastAPI(title="NoiseCleaner ML API")

# Resolve model paths relative to this script's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LR_MODEL_PATH = os.path.join(BASE_DIR, "models", "logistic_regression_model.pkl")
SVM_MODEL_PATH = os.path.join(BASE_DIR, "models", "linear_svm_model.pkl")

# ---------------------------------------------------------------------------
# Lazy-loaded model cache.
# Nothing is loaded at import time. Each model is loaded once on first use
# and then reused for all subsequent requests. This avoids paying the full
# ~400 MB PyTorch + MiniLM cost at startup before Render's health-check
# window, and avoids loading classifiers the user never selects.
# ---------------------------------------------------------------------------
_model_cache: dict = {}


def _get_embedder():
    """Return the shared SentenceTransformer, loading it on first call."""
    if "embedder" not in _model_cache:
        print("Lazy-loading SentenceTransformer model...")
        import torch
        torch.set_num_threads(1)

        from sentence_transformers import SentenceTransformer
        _model_cache["embedder"] = SentenceTransformer(
            'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
        )
        print("SentenceTransformer loaded.")
    return _model_cache["embedder"]


def _get_classifier(name: str):
    """Return the requested sklearn classifier, loading it on first call."""
    if name not in _model_cache:
        path = LR_MODEL_PATH if name == "lr" else SVM_MODEL_PATH
        print(f"Lazy-loading classifier: {name} from {path}")
        _model_cache[name] = joblib.load(path)
        print(f"Classifier {name} loaded.")
    return _model_cache[name]


class CleanRequest(BaseModel):
    text: str
    model: str = "svm"  # "svm" or "lr"


@app.post("/predict")
def predict(req: CleanRequest):
    # Load only the models actually needed for this request
    try:
        embedder = _get_embedder()
        model_to_use = _get_classifier(req.model if req.model in ("svm", "lr") else "svm")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to load models: {e}")

    lines = [line.strip() for line in req.text.split('\n') if line.strip()]

    if not lines:
        return {
            "segments": [],
            "cleanedText": "",
            "metrics": {
                "totalSegments": 0,
                "noiseRemoved": 0,
                "contentRetained": 0,
                "cleaningRatio": 0.0
            }
        }

    # Generate embeddings
    embeddings = embedder.encode(lines)

    # Predict (assumes 1 is signal/editorial, 0 is noise)
    predictions = model_to_use.predict(embeddings)

    # Optional: If the model has predict_proba, we can get confidence scores
    # SVM might not have predict_proba enabled, so we'll fallback to a mock score if missing
    if hasattr(model_to_use, "predict_proba"):
        try:
            probabilities = model_to_use.predict_proba(embeddings)
        except Exception:
            probabilities = None
    else:
        probabilities = None

    formatted_segments = []
    cleaned_segments = []

    for i, (line, pred) in enumerate(zip(lines, predictions)):
        is_noise = bool(pred != 1)

        # Calculate a fake or real confidence score
        if probabilities is not None:
            # probability of the predicted class
            score = float(np.max(probabilities[i]))
        else:
            score = 0.95  # Mock score if not available

        formatted_segments.append({
            "id": f"seg_{i + 1}",
            "text": line,
            "isNoise": is_noise,
            "score": round(score, 2),
            "type": "noise" if is_noise else "signal",
            "reason": "Predicted as noise by ML model" if is_noise else "Predicted as signal by ML model"
        })

        if not is_noise:
            cleaned_segments.append(line)

    cleaned_text = "\n\n".join(cleaned_segments)

    total_segments = len(formatted_segments)
    noise_removed = sum(1 for s in formatted_segments if s["isNoise"])
    content_retained = total_segments - noise_removed
    cleaning_ratio = (noise_removed / total_segments * 100) if total_segments > 0 else 0

    return {
        "segments": formatted_segments,
        "cleanedText": cleaned_text,
        "metrics": {
            "totalSegments": total_segments,
            "noiseRemoved": noise_removed,
            "contentRetained": content_retained,
            "cleaningRatio": round(cleaning_ratio, 1)
        }
    }
