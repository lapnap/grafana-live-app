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
  wget https://gist.github.com/ryantxu/2f38b39a8a1f8441b0330a4bde34b3fd/raw/87008ea00efd6b8c42a9789f4d6d72c3a522ba3d/grafana-ui-6.3pre.zip
  unzip grafana-ui-6.3pre.zip
  cd ../..
else
  echo "Source for Grafana already present, skipping..."
fi
