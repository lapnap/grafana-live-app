#!/bin/bash

# install npm modules
echo "Installing NPM modules with yarn"
yarn install
echo "Ensure Grafana source available"

TARGETDIR='node_modules/@grafana'

if [ ! -d $TARGETDIR ]; then
  echo "Copy grafana ui $TARGETDIR"
  mkdir $TARGETDIR
  cd $TARGETDIR
  wget https://gist.github.com/ryantxu/2f38b39a8a1f8441b0330a4bde34b3fd/raw/32234402d747dcabdfb6c761ea5d1028adaeb8b8/grafana-ui-6.2.0.zip
  unzip grafana-ui-6.2.0.zip
  cd ../..
else
  echo "Source for Grafana already present, skipping..."
fi
