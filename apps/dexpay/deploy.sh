#!/bin/bash

# Define paths
REPO1_PATH="$(pwd)"
REPO2_PATH="../repo2"

# Step 1: Build the project
echo "Building Vite project..."
yarn build build || { echo "Build failed! Exiting..."; exit 1; }

# Step 2: Move/copy the dist folder to repo2
echo "Moving dist to repo2..."
rm -rf $REPO2_PATH/dist # Remove old dist
mv $REPO1_PATH/dist $REPO2_PATH/ # Move new dist

# Step 3: Push changes to repo2
cd $REPO2_PATH || { echo "Failed to navigate to repo2!"; exit 1; }
git add dist
git commit -m "Auto-deploy: $(date)"
git push origin main # Change branch if needed

# Step 4: Return to repo1
cd $REPO1_PATH
echo "Deployment completed successfully!"
