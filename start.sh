#!/bin/bash

set -e
echo "starting server"
node server.js -H 0.0.0.0 -p 3000
