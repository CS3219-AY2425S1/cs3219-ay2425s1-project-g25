#!/bin/bash

# Copy .env.example to .env, overwriting if .env exists
find . -name ".env.example" | while read -r EXAMPLE_FILE; do
    ENV_FILE="${EXAMPLE_FILE%.example}"
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo "Replaced or created .env from .env.example at $ENV_FILE"
done

# Define the docker-compose files with relative paths
COMPOSE_FILES=(
    "./docker-compose.yml"
    "./addon/chat/docker-compose.yml"
)

# Start each docker-compose file
for FILE in "${COMPOSE_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        docker-compose -f "$FILE" up -d
    else
        echo "File not found: $FILE"
    fi
done
