#!/bin/bash

# Variables
GHPAGES_REPO_PATH="../../../gh-pages.dexpay"

# Build the Vite project
yarn build

rm -rf $GHPAGES_REPO_PATH/*
cp -r dist/* $GHPAGES_REPO_PATH/

cd $GHPAGES_REPO_PATH
git add .
git commit -m "Deploy from DEXPAY - $(date)"
git push origin main
