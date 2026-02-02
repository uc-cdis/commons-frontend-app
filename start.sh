#!/bin/bash

set -e
echo "starting server"
echo "Current directory: $(pwd)"

# Check if we need to be in standalone directory
if [ -f ".next/standalone/server.js" ]; then
    cd .next/standalone
    echo "Starting server from $(pwd)"
    HOSTNAME=0.0.0.0 node server.js
else
    echo "Starting server from $(pwd)"
    HOSTNAME=0.0.0.0 node .next/standalone/server.js
fi
