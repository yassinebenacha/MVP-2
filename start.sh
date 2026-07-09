#!/bin/bash

# Force production mode for runtime execution
export NODE_ENV=production

# Constrain PyTorch/MKL/OMP to single-threaded mode to minimize RAM usage.
# These must be set BEFORE Python imports torch.
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
export TORCH_NUM_THREADS=1
export TOKENIZERS_PARALLELISM=false

# Start FastAPI Python backend in the background on loopback.
# --workers 1: prevents duplicate model loading across worker processes.
# --timeout-keep-alive 5: releases idle connections quickly to free memory.
echo "Starting Python FastAPI backend on port 8000..."
uvicorn api:app --host 127.0.0.1 --port 8000 --workers 1 --timeout-keep-alive 5 &

# Allow startup time for service initialization (models load lazily on first request)
sleep 2

# Start Express gateway server in the foreground on the port assigned by Render
echo "Starting Express gateway server on port $PORT..."
exec node build-server/server.cjs
