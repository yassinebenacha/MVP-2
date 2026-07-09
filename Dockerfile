# Use a base image with both Python and Node.js pre-installed
FROM nikolaik/python-nodejs:python3.10-nodejs20

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./
COPY requirements.txt ./

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download and cache the SentenceTransformer model during image build.
# This prevents slow startup and network timeouts on deployment.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

# Install Node packages (including devDependencies needed for building)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React frontend and compile server.ts to build-server/server.cjs
RUN npm run build

# Prune devDependencies to reduce container size
RUN npm prune --omit=dev

# Set production environment variable for runtime
ENV NODE_ENV=production

# Expose Express server default port (Render will override this via the PORT environment variable)
EXPOSE 3000

# Copy and set execution permissions on the startup script
COPY start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh
RUN chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
