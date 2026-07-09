#!/bin/bash

# Force production mode for runtime execution
export NODE_ENV=production

# Start FastAPI Python backend in the background on loopback
echo "Starting Python FastAPI backend on port 8000..."
uvicorn api:app --host 127.0.0.1 --port 8000 &

# Allow startup time for model loading and service initialization
sleep 3

# Start Express gateway server in the foreground on the port assigned by Render
echo "Starting Express gateway server on port $PORT..."
exec node build-server/server.cjs
