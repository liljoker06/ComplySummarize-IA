# ========== FRONTEND BUILD (React/Vite) ==========
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ========== BACKEND + OLLAMA BASE ==========
FROM node:18-slim AS backend-base

RUN apt-get update && apt-get install -y \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN mkdir -p uploads

# ========== OLLAMA INSTALL ==========
FROM backend-base AS backend-ollama

# Installe Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Crée le script de démarrage
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'trap "kill 0" SIGINT SIGTERM' >> /app/start.sh && \
    echo 'ollama serve & OLLAMA_PID=$!' >> /app/start.sh && \
    echo 'while ! curl -s http://localhost:11434/api/tags > /dev/null; do sleep 2; done' >> /app/start.sh && \
    echo 'ollama pull gemma2:2b' >> /app/start.sh && \
    echo 'ollama pull llama3.2:1b' >> /app/start.sh && \
    echo 'npm start & NODE_PID=$!' >> /app/start.sh && \
    echo 'wait $OLLAMA_PID $NODE_PID' >> /app/start.sh

RUN chmod +x /app/start.sh

# ========== FINAL STAGE ==========
FROM nginx:alpine

# --- FRONTEND ---
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# --- BACKEND + OLLAMA ---
COPY --from=backend-ollama /app /app
# COPY --from=backend-ollama /root/.ollama /root/.ollama

# Définir la variable d'environnement
ENV NODE_ENV=production
ENV OLLAMA_HOST=0.0.0.0:11434

# Exposer les ports (80 pour frontend, 5000 pour backend, 11434 pour Ollama)
EXPOSE 80 5000 11434

# Démarrage des services backend + Ollama + frontend
CMD ["/app/start.sh"]
