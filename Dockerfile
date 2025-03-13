FROM python:3.12-slim as backend-builder

WORKDIR /flare-ai-defai

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only dependency files first
COPY pyproject.toml README.md ./

# Create src directory and copy files
COPY src/ src/

# Install dependencies with verbose output and error logging
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir wheel setuptools && \
    pip install --no-cache-dir -v -e . 2>&1 | tee pip_install.log || (cat pip_install.log && exit 1)

FROM node:16.20.0-slim as frontend-builder

WORKDIR /frontend

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first
COPY chat-ui/package*.json ./

# Install dependencies with increased memory limit and production only
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm ci --only=production --no-audit --no-optional

# Copy the rest of the frontend code
COPY chat-ui/ .

# Build frontend with production optimization
RUN npm run build --production

FROM python:3.12-slim

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
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -v -e . 2>&1 | tee pip_install.log || (cat pip_install.log && exit 1)

# Configure nginx
COPY nginx.conf /etc/nginx/sites-enabled/default

# Configure supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set environment variables
ENV PYTHONPATH=/app/src \
    PORT=8000 \
    PYTHONUNBUFFERED=1 \
    PYTHONOPTIMIZE=1 \
    PYTHONDONTWRITEBYTECODE=1

# Create required directories and set permissions
RUN mkdir -p /var/log/nginx /var/log/supervisor /run/nginx /var/run /var/lib/nginx/body /var/cache/nginx && \
    touch /var/log/supervisor/supervisord.log && \
    touch /var/run/supervisor.sock && \
    touch /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log && \
    touch /run/nginx.pid && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /usr/share/nginx/html && \
    chown -R www-data:www-data /var/lib/nginx && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /run/nginx && \
    chown www-data:www-data /run/nginx.pid && \
    chown -R root:root /var/log/supervisor && \
    chown -R root:root /var/run/supervisor.sock && \
    chmod -R 755 /var/log/nginx /var/log/supervisor /run/nginx /var/lib/nginx /var/cache/nginx && \
    chmod 644 /var/log/nginx/error.log /var/log/nginx/access.log && \
    chmod 700 /var/run/supervisor.sock

# Create health check file
RUN echo "OK" > /usr/share/nginx/html/health.html && \
    chown www-data:www-data /usr/share/nginx/html/health.html

# Expose ports
EXPOSE 80 8000

# Start supervisor
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]