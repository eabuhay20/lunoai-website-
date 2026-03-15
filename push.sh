#!/bin/bash

# Load the GitHub token from .env
if [ -f .env ]; then
  export $(cat .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if token is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN is empty in .env"
  exit 1
fi

# Configure git to use the token for authentication
git config --local credential.helper store
echo "https://eabuhay20:${GITHUB_TOKEN}@github.com" > ~/.git-credentials
chmod 600 ~/.git-credentials

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

# Clean up credentials (optional, for security)
rm ~/.git-credentials
git config --local --unset credential.helper

echo "Push complete!"
