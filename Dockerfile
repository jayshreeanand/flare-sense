FROM python:3.11-slim as backend-builder

WORKDIR /flare-ai-defai

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only dependency files first
COPY pyproject.toml README.md ./

# Create src directory and copy files
COPY src/ src/

# Install dependencies
RUN pip install --no-cache-dir -e .

FROM node:16.20.0-slim as frontend-builder

WORKDIR /frontend

# Copy package files first
COPY chat-ui/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY chat-ui/ .

# Build frontend
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY --from=backend-builder /flare-ai-defai/src ./src
COPY --from=backend-builder /flare-ai-defai/pyproject.toml .
COPY --from=backend-builder /flare-ai-defai/README.md .

# Copy frontend build
COPY --from=frontend-builder /frontend/build /usr/share/nginx/html

# Install backend dependencies
RUN pip install --no-cache-dir -e .

# Configure nginx
COPY nginx.conf /etc/nginx/sites-enabled/default

# Configure supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set environment variables
ENV PYTHONPATH=/app/src \
    PORT=8000 \
    PYTHONUNBUFFERED=1

# Create required directories
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/log/supervisor && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /usr/share/nginx/html

# Expose ports
EXPOSE 80 8000

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]