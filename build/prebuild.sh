#!/bin/bash

# install npm modules
echo "Installing NPM modules with yarn"
yarn install
echo "Ensure Grafana source available"

TARGETDIR='node_modules/@grafana'

if [ ! -d $TARGETDIR ]; then
  echo "Cloning Grafana source into $TARGETDIR"
  git clone https://github.com/grafana/grafana.git --depth 1 $TARGETDIR
  cd $TARGETDIR
  yarn install --pure-lockfile
  yarn gui:build
  mv packages/grafana-ui/dist ui
  cd ../..
else
  echo "Source for Grafana already present, skipping..."
fi
