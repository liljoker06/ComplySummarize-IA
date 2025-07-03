# ========== Étape 1 : Build du frontend ==========
FROM node:18-alpine AS builder

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY frontend/ .

# Passer la variable d'API à Vite
ARG VITE_API_URL=https://complysummarize-ia.up.railway.app/api
ENV VITE_API_URL=$VITE_API_URL

# Construire l'application
RUN npm run build

# ========== Étape 2 : Serveur de production avec Nginx ==========
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés dans le répertoire statique de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
