# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY chat-ui/ .
RUN npm install
RUN npm run build

# Stage 2: Build Backend
FROM python:3.12-slim AS backend-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml .
COPY .env .

# Install Python dependencies
RUN pip install --no-cache-dir "uv==0.1.24" && \
    uv venv && \
    . .venv/bin/activate && \
    uv pip install -e .

# Copy application code
COPY src/ src/

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["python", "-m", "flare_ai_defai.main"]

# Stage 3: Final Image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install nginx and supervisor
RUN apt-get update && apt-get install -y nginx supervisor curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend files from builder
COPY --from=backend-builder /app/.venv ./.venv
COPY --from=backend-builder /app/src ./src
COPY --from=backend-builder /app/pyproject.toml .
COPY --from=backend-builder /app/README.md .

# Copy frontend files
COPY --from=frontend-builder /frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-enabled/default

# Setup supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Allow workload operator to override environment variables
LABEL "tee.launch_policy.allow_env_override"="GEMINI_API_KEY,GEMINI_MODEL,WEB3_PROVIDER_URL,WEB3_EXPLORER_URL,SIMULATE_ATTESTATION"
LABEL "tee.launch_policy.log_redirect"="always"

EXPOSE 80

# Start supervisor (which will start both nginx and the backend)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]