# 🐳 Docker Setup - ComplySummarize IA

Ce dossier contient la configuration Docker complète pour l'application ComplySummarize IA.

## 📋 Services inclus

- **Frontend** (React/Vite) - Port 3000
- **Backend** (Node.js + Ollama) - Port 5000
- **MySQL** (Base de données) - Port 3306
- **phpMyAdmin** (Administration DB) - Port 8080
- **Ollama** (IA locale) - Port 11434

## 🚀 Démarrage rapide

### 1. Construire et démarrer tous les services

```bash
cd docker
docker-compose up --build
```

### 2. Démarrage en arrière-plan

```bash
docker-compose up -d --build
```

### 3. Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔧 Configuration

### Variables d'environnement

Modifiez le fichier `docker.env` pour personnaliser :

- Mots de passe de la base de données
- Clé JWT
- Ports des services
- URLs

### Modèles Ollama pré-installés

Le backend télécharge automatiquement ces modèles :

- **gemma3:1b** (~0.8 GB) - Modèle léger
- **gemma3:12b** (~7.6 GB) - Modèle performant
- **llama3.1:latest** (~4.7 GB) - Modèle polyvalent

## 📂 Volumes persistants

- `mysql_data` - Données MySQL
- `backend_uploads` - Fichiers uploadés
- `ollama_data` - Modèles Ollama

## 🌐 Accès aux services

Une fois démarré, accédez à :

- **Application web** : http://localhost:3000
- **API Backend** : http://localhost:5000
- **phpMyAdmin** : http://localhost:8080
- **Ollama API** : http://localhost:11434

## 🛠️ Commandes utiles

### Arrêter tous les services

```bash
docker-compose down
```

### Supprimer les volumes (⚠️ Supprime les données)

```bash
docker-compose down -v
```

### Reconstruire un service spécifique

```bash
docker-compose build backend
docker-compose up -d backend
```

### Voir l'état des services

```bash
docker-compose ps
```

### Accéder au shell d'un container

```bash
# Backend
docker-compose exec backend sh

# Base de données
docker-compose exec mysql mysql -u root -p
```

## 🔍 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Changer les ports dans docker-compose.yaml
   ports:
     - "3001:80"  # Au lieu de 3000:80
   ```

2. **Manque d'espace disque**
   ```bash
   # Nettoyer Docker
   docker system prune -a
   ```

3. **Modèles Ollama non téléchargés**
   ```bash
   # Redémarrer le backend
   docker-compose restart backend
   ```

### Logs détaillés

```bash
# Voir les logs de démarrage d'Ollama
docker-compose logs backend | grep ollama

# Voir les logs de téléchargement des modèles
docker-compose logs backend | grep "Téléchargement"
```

## 📊 Monitoring

### Santé des services

```bash
# Vérifier la santé de tous les services
docker-compose ps

# Tester les endpoints
curl http://localhost:5000/api/auth/validate
curl http://localhost:11434/api/tags
```

### Utilisation des ressources

```bash
# Voir l'utilisation CPU/RAM
docker stats

# Espace disque des volumes
docker system df
```

## 🔐 Sécurité

⚠️ **Important pour la production** :

1. Changez les mots de passe dans `docker.env`
2. Modifiez la clé JWT
3. Utilisez HTTPS avec un reverse proxy (Nginx/Traefik)
4. Fermez les ports non nécessaires

## 📈 Performance

### Optimisations recommandées

1. **Allocation mémoire pour Ollama** (modèles volumineux)
   ```yaml
   deploy:
     resources:
       limits:
         memory: 16G
   ```

2. **Cache Docker** pour des builds plus rapides
   ```bash
   export DOCKER_BUILDKIT=1
   ```

3. **SSD recommandé** pour les modèles Ollama

## 🆘 Support

En cas de problème :

1. Vérifiez les logs : `docker-compose logs -f`
2. Vérifiez l'espace disque : `df -h`
3. Redémarrez les services : `docker-compose restart` 