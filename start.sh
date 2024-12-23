#!/bin/bash

set -e
echo "starting server"
HOST=0.0.0.0 PORT=3000 node server.js
