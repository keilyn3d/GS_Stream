#!/bin/sh

set -e

# Load environment variables from .env file (if available)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set variables
IMAGE_NAME="webinspector-csr-front"
IMAGE_TAG="latest"
FULL_TAG="$IMAGE_NAME:$IMAGE_TAG"

echo "Starting Docker build for $IMAGE_NAME with REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL, REACT_APP_CSR_BACKEND_URL=$REACT_APP_CSR_BACKEND_URL, REACT_APP_REQUIRE_AUTH=$REACT_APP_REQUIRE_AUTH, and REACT_APP_AUTH_BACKEND_URL=$REACT_APP_AUTH_BACKEND_URL..."

# Build and load Docker image locally
docker build \
  --build-arg REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL \
  --build-arg REACT_APP_CSR_BACKEND_URL=$REACT_APP_CSR_BACKEND_URL \
  --build-arg REACT_APP_REQUIRE_AUTH=$REACT_APP_REQUIRE_AUTH \
  --build-arg REACT_APP_AUTH_BACKEND_URL=$REACT_APP_AUTH_BACKEND_URL \
  -t $FULL_TAG \
  --progress=plain \
  .


echo "Docker image built and loaded to local Docker successfully: $FULL_TAG"
