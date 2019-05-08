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
  wget https://gist.github.com/ryantxu/2f38b39a8a1f8441b0330a4bde34b3fd/raw/3bd198af81b241ac331d66598488d982fc7c8e3b/grafana-ui-6.3pre.zip
  unzip grafana-ui-6.3pre.zip
  cd ../..
else
  echo "Source for Grafana already present, skipping..."
fi
