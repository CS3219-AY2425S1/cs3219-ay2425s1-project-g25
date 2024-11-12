#!/bin/bash

# Variables
DOCKER_USERNAME="rjkoh"
TAG="latest"

echo "Applying Kubernetes deployment file for kafka..."
kubectl apply -f kubernetes/kafka/kafka-deployment.yaml --validate=false
echo "Deployment for kafka complete."
echo "----------------------------------------"

echo "Applying Kubernetes deployment file for zookeeper..."
kubectl apply -f kubernetes/zookeeper/zookeeper-deployment.yaml --validate=false
echo "Deployment for zookeeper complete."
echo "----------------------------------------"

echo "Applying Kubernetes deployment file for redis..."
kubectl apply -f kubernetes/redis/redis-deployment.yaml --validate=false
echo "Deployment for redis complete."
echo "----------------------------------------"

echo "Applying Kubernetes deployment file for mongo..."
kubectl apply -f kubernetes/mongo/mongo-deployment.yaml --validate=false
echo "Deployment for mongo complete."
echo "----------------------------------------"

# Lists of services and their corresponding deployment YAML paths
services=("collaboration-service" "matching-service" "question-service" "user-service")

# Loop through each service
for i in "${!services[@]}"; do
  SERVICE="${services[$i]}"
  SERVICE_NAME="cs3219-ay2425s1-project-g25_${SERVICE}"
  K8S_DEPLOYMENT_FILE="kubernetes/backend/${SERVICE}-deployment.yaml"
  K8S_HPA_FILE="kubernetes/hpa/${SERVICE}-hpa.yaml"
  
  # Define the full image name
  FULL_IMAGE_NAME="$DOCKER_USERNAME/$SERVICE_NAME:$TAG"
  
  # Tag the Docker image
  echo "Tagging image $SERVICE as $FULL_IMAGE_NAME..."
  docker tag $SERVICE_NAME $FULL_IMAGE_NAME
  
  # Push the Docker image to Docker Hub
  echo "Pushing image $FULL_IMAGE_NAME to Docker Hub..."
  docker push $FULL_IMAGE_NAME
  
  # Update the Kubernetes deployment YAML to use the new image name
  echo "Updating image name in Kubernetes deployment file $K8S_DEPLOYMENT_FILE..."
  sed -i.bak "s|image: .*$|image: $FULL_IMAGE_NAME|g" $K8S_DEPLOYMENT_FILE
  
  # Apply the updated deployment file to Kubernetes
  echo "Applying Kubernetes deployment file $K8S_DEPLOYMENT_FILE..."
  kubectl apply -f $K8S_DEPLOYMENT_FILE --validate=false

  # Apply the HPA file to Kubernetes
  echo "Applying Kubernetes HPA file $K8S_HPA_FILE..."
  kubectl apply -f $K8S_HPA_FILE --validate=false
  
  # Cleanup backup file created by sed on macOS
  rm "$K8S_DEPLOYMENT_FILE.bak"

  echo "Deployment for $SERVICE complete."
  echo "----------------------------------------"
done

# frontend
SERVICE="frontend"
SERVICE_NAME="cs3219-ay2425s1-project-g25_${SERVICE}"
K8S_DEPLOYMENT_FILE="kubernetes/frontend/${SERVICE}-deployment.yaml"
FULL_IMAGE_NAME="$DOCKER_USERNAME/$SERVICE_NAME:$TAG"
echo "Tagging image $SERVICE as $FULL_IMAGE_NAME..."
docker tag $SERVICE_NAME $FULL_IMAGE_NAME
echo "Pushing image $FULL_IMAGE_NAME to Docker Hub..."
docker push $FULL_IMAGE_NAME
echo "Updating image name in Kubernetes deployment file $K8S_DEPLOYMENT_FILE..."
sed -i.bak "s|image: .*$|image: $FULL_IMAGE_NAME|g" $K8S_DEPLOYMENT_FILE
echo "Applying Kubernetes deployment file $K8S_DEPLOYMENT_FILE..."
kubectl apply -f $K8S_DEPLOYMENT_FILE --validate=false
rm "$K8S_DEPLOYMENT_FILE.bak"
echo "Deployment for $SERVICE complete."
echo "----------------------------------------"

# nginx
SERVICE_NAME="cs3219-ay2425s1-project-g25_nginx"
K8S_DEPLOYMENT_FILE="kubernetes/backend/nginx-deployment.yaml"
FULL_IMAGE_NAME="$DOCKER_USERNAME/$SERVICE_NAME:$TAG"
echo "Tagging image $SERVICE as $FULL_IMAGE_NAME..."
docker tag $SERVICE_NAME $FULL_IMAGE_NAME
echo "Pushing image $FULL_IMAGE_NAME to Docker Hub..."
docker push $FULL_IMAGE_NAME
echo "Updating image name in Kubernetes deployment file $K8S_DEPLOYMENT_FILE..."
sed -i.bak "s|image: .*$|image: $FULL_IMAGE_NAME|g" $K8S_DEPLOYMENT_FILE
echo "Applying Kubernetes deployment file $K8S_DEPLOYMENT_FILE..."
kubectl apply -f $K8S_DEPLOYMENT_FILE --validate=false
rm "$K8S_DEPLOYMENT_FILE.bak"
echo "Deployment for $SERVICE complete."
echo "----------------------------------------"

echo "All services deployed successfully."
