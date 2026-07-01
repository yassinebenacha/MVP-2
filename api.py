import joblib
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="NoiseCleaner ML API")

print("Loading models...")
try:
    lr_model = joblib.load("models/logistic_regression_model.pkl")
    svm_model = joblib.load("models/linear_svm_model.pkl")
    embedder = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    lr_model, svm_model, embedder = None, None, None

class CleanRequest(BaseModel):
    text: str
    model: str = "svm" # "svm" or "lr"

@app.post("/predict")
def predict(req: CleanRequest):
    if not lr_model or not svm_model or not embedder:
        raise HTTPException(status_code=503, detail="Models are not loaded.")

    if req.model == "lr":
        model_to_use = lr_model
    else:
        model_to_use = svm_model

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
            score = 0.95 # Mock score if not available

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
