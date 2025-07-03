echo "▶ Building all services..."
docker compose --env-file docker.env -f docker-compose.yaml build
