# 🧹 NOISECLEANER

**Intelligent Web Content Noise Removal using Machine Learning**

NOISECLEANER is a full-stack web application that automatically separates meaningful content from boilerplate noise in scraped web pages. It leverages multilingual SentenceTransformer embeddings with classical ML classifiers (Linear SVM and Logistic Regression) to deliver high-precision text cleaning for NLP pipelines — all behind a modern React interface with secure HTTPS deployment.

> **Engineering Internship Project** — Built with a production-grade architecture on Oracle Cloud Infrastructure.

---

## ✨ Features

- **Automatic Web Content Cleaning** — Paste raw HTML or scraped text and receive clean, structured output
- **Machine Learning Classification** — Two trained classifiers with real-time inference:
  - Linear SVM
  - Logistic Regression
- **Multilingual SentenceTransformer Embeddings** — Powered by `paraphrase-multilingual-MiniLM-L12-v2`
- **Gemini LLM Fallback** — Optional Google Gemini integration for AI-powered classification
- **REST API** — Clean JSON API with detailed segment-level analysis and confidence scores
- **Modern React Interface** — Responsive SPA built with React 19, Vite, and Tailwind CSS
- **Firebase Authentication** — Secure user authentication
- **HTTPS Deployment** — Production SSL via Let's Encrypt
- **Automatic CI/CD** — Zero-downtime deployments on every push to `main`

---

## 🌐 Live Demo

🔗 **[https://noisecleaner.duckdns.org/#/](https://noisecleaner.duckdns.org/#/)**

---

## 🏗️ Architecture

```text
┌─────────────────────────────────┐
│   Frontend (React + Vite + TS)  │
│         Port: 5173 (dev)        │
└───────────────┬─────────────────┘
                │  HTTPS
                ▼
┌─────────────────────────────────┐
│     Nginx Reverse Proxy         │
│  SSL termination (Let's Encrypt)│
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  Node.js Express Gateway        │
│         Port: 3000              │
│  Routes, CORS, Gemini fallback  │
└───────────────┬─────────────────┘
                │  HTTP (internal)
                ▼
┌─────────────────────────────────┐
│       FastAPI ML API            │
│       Port: 8000 (internal)     │
│   Not exposed to the internet   │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│  SentenceTransformer Embeddings │
│  + Scikit-learn Classifiers     │
│  (Linear SVM & Logistic Reg.)   │
└─────────────────────────────────┘
```

**Request flow:** The browser sends a `POST /api/clean` request to the Express gateway. For SVM/LR models, Express forwards the request to the internal FastAPI service at `127.0.0.1:8000`. FastAPI generates multilingual embeddings, runs the selected classifier, and returns structured predictions. The FastAPI service is never exposed to the public internet.

---

## 📁 Repository Structure

```text
noisecleaner/
├── frontend/                    # React SPA
│   ├── src/                     # Application source code
│   ├── public/                  # Static assets
│   ├── firebase.ts              # Firebase Authentication config
│   ├── vite.config.ts           # Vite build configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── package.json             # Node.js dependencies
│
├── backend/                     # API layer
│   ├── server.ts                # Express gateway (routing, CORS, Gemini)
│   ├── api.py                   # FastAPI ML service (embeddings + classifiers)
│   ├── models/                  # Trained ML models
│   │   ├── logistic_regression_model.pkl
│   │   └── linear_svm_model.pkl
│   ├── requirements.txt         # Python dependencies
│   ├── package.json             # Node.js dependencies
│   └── tsconfig.json            # TypeScript configuration
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD pipeline (GitHub Actions → Oracle Cloud)
│
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore index definitions
└── README.md
```

---

## 🛠️ Technologies

| Layer              | Technologies                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| **Frontend**       | React 19, Vite, TypeScript, Tailwind CSS 4, Firebase Auth, Motion         |
| **Backend**        | Node.js, Express, TypeScript, esbuild                                     |
| **Machine Learning** | FastAPI, SentenceTransformers, Scikit-learn, NumPy, Joblib, Python 3    |
| **DevOps**         | GitHub Actions, PM2, Nginx, Let's Encrypt, DuckDNS, Docker (optional)    |
| **Cloud**          | Oracle Cloud Infrastructure (Ubuntu VM), SSH deployment                   |

---

## 💻 Local Development

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- npm

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts on `http://localhost:5173` by default.

Set up environment variables from the template:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
```

### Backend

```bash
cd backend

# Python environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows
pip install -r requirements.txt

# Node.js dependencies
npm install

# Start both Express and FastAPI concurrently
npm run dev:all
```

| Service         | URL                         |
| --------------- | --------------------------- |
| Frontend (Vite) | `http://localhost:5173`      |
| Express Gateway | `http://localhost:3000`      |
| FastAPI ML API  | `http://127.0.0.1:8000`     |

---

## 🚀 Production Deployment

The application is hosted on **Oracle Cloud Infrastructure** on an Ubuntu Server VM with a fully automated deployment pipeline.

### Infrastructure Stack

| Component          | Role                                               |
| ------------------ | -------------------------------------------------- |
| **Ubuntu Server**  | Oracle Cloud VM running all services                |
| **Nginx**          | Reverse proxy — terminates SSL, routes traffic      |
| **PM2**            | Process manager — keeps Express and FastAPI alive   |
| **Let's Encrypt**  | Free, automated HTTPS certificates                 |
| **DuckDNS**        | Dynamic DNS — maps `noisecleaner.duckdns.org`       |
| **GitHub Actions**  | CI/CD — triggers deployment on every push to `main` |

### PM2 Managed Processes

```text
┌──────────────────────┬────────┬──────┐
│ Name                 │ Mode   │ Port │
├──────────────────────┼────────┼──────┤
│ noisecleaner-backend │ fork   │ 3000 │
│ noisecleaner-api     │ fork   │ 8000 │
└──────────────────────┴────────┴──────┘
```

---

## 🔄 CI/CD

Every push to the `main` branch triggers a fully automated deployment via GitHub Actions.

```text
  Developer
      │
      ▼
  git push (main)
      │
      ▼
  GitHub Actions
      │
      ▼
  SSH into Oracle Cloud VM
      │
      ▼
  ┌──────────────────────────────┐
  │  git fetch --all             │
  │  git reset --hard origin/main│
  │                              │
  │  cd frontend/                │
  │  npm install                 │
  │  npm run build               │
  │                              │
  │  cd backend/                 │
  │  npm install  (if changed)   │
  │  pip install  (if changed)   │
  │                              │
  │  pm2 restart backend         │
  │  pm2 restart api             │
  └──────────────────────────────┘
      │
      ▼
  ✅ Production Live
```

**Smart dependency caching:** The pipeline detects changes in `package-lock.json` and `requirements.txt`, only running `npm install` or `pip install` when dependencies have actually changed.

The workflow is defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

---

## 📡 API

### `POST /api/clean`

The main cleaning endpoint. Routes requests through the Express gateway to the appropriate model.

**Request:**

```json
{
  "text": "<nav>Home | About</nav>\n<p>Machine learning is transforming NLP.</p>",
  "model": "svm"
}
```

| Parameter | Type     | Default | Description                                      |
| --------- | -------- | ------- | ------------------------------------------------ |
| `text`    | `string` | —       | Raw text or HTML to clean (required)              |
| `model`   | `string` | `"svm"` | Model to use: `"svm"`, `"lr"`, or `"gemini"`     |

**Response:**

```json
{
  "segments": [
    {
      "id": "seg_1",
      "text": "<nav>Home | About</nav>",
      "isNoise": true,
      "score": 0.95,
      "type": "noise",
      "reason": "Predicted as noise by ML model"
    },
    {
      "id": "seg_2",
      "text": "Machine learning is transforming NLP.",
      "isNoise": false,
      "score": 0.92,
      "type": "signal",
      "reason": "Predicted as signal by ML model"
    }
  ],
  "cleanedText": "Machine learning is transforming NLP.",
  "metrics": {
    "totalSegments": 2,
    "noiseRemoved": 1,
    "contentRetained": 1,
    "cleaningRatio": 50.0
  }
}
```

---

### `POST /predict`

Internal FastAPI endpoint for ML inference. Called by the Express gateway — not exposed publicly.

**Request:**

```json
{
  "text": "Raw text input with multiple lines\nSeparated by newlines",
  "model": "svm"
}
```

| Parameter | Type     | Default | Description                           |
| --------- | -------- | ------- | ------------------------------------- |
| `text`    | `string` | —       | Text to classify (required)           |
| `model`   | `string` | `"svm"` | Classifier: `"svm"` or `"lr"`        |

---

### `GET /health`

Health check endpoint for monitoring.

**Response:**

```json
{
  "status": "ok",
  "service": "noisecleaner-backend"
}
```

---

## 🔒 Security

| Measure                    | Implementation                                                    |
| -------------------------- | ----------------------------------------------------------------- |
| **HTTPS**                  | TLS certificates via Let's Encrypt, auto-renewed                  |
| **Reverse Proxy**          | Nginx handles SSL termination; backend services are not exposed   |
| **Environment Variables**  | Sensitive keys stored in `.env` files, excluded from Git           |
| **GitHub Secrets**         | SSH keys and deployment credentials stored in GitHub Secrets       |
| **SSH Deployment**         | CI/CD connects to the VM over SSH with private key authentication |
| **Firebase Auth**          | User authentication handled by Firebase                           |
| **CORS**                   | Origin-restricted via `CORS_ORIGIN` environment variable          |
| **Internal API Isolation** | FastAPI listens on `127.0.0.1` only — inaccessible from outside   |

---

## 🗺️ Future Improvements

| Area                 | Improvement                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| **Models**           | Fine-tune transformers on domain-specific datasets                        |
| **Models**           | Add ensemble methods combining SVM + LR predictions                       |
| **Models**           | Experiment with deep learning classifiers (BERT fine-tuning)              |
| **Features**         | Batch processing for multiple URLs                                        |
| **Features**         | Export cleaned content in multiple formats (JSON, TXT, CSV)               |
| **Features**         | User history and saved cleaning sessions                                  |
| **Infrastructure**   | Add Redis caching for repeated cleaning requests                          |
| **Infrastructure**   | Container orchestration with Docker Compose                               |
| **Monitoring**       | Centralized logging and performance metrics dashboard                     |
| **Testing**          | End-to-end test suite with Playwright                                     |
| **API**              | Rate limiting and API key authentication for external consumers           |

---

## 👤 Author

**Yassine Ben Acha**

Engineering Internship Project · [Harmony Technology](https://harmony-technology.com)

---

<div align="center">

Built with ❤️ using React, FastAPI, and Machine Learning

</div>
