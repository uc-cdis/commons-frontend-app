#!/usr/bin/env python3
"""Minimal micromamba stub for Alpine Docker builds.

prepare_wasm.js from @jupyterlite/cockle makes two calls:
  1. micromamba --version          (existence check)
  2. micromamba -p <env> list --json  (package list, to decide whether to reuse existing env)

conda-meta/*.json records are written by micromamba during install and are NOT inside
the .tar.bz2 archives, so we hardcode the list here instead of reading from the filesystem.

Keep PACKAGES in sync with packages/sampleCommons/cockle-config.json and the URLs in Dockerfile.
"""
import sys
import json

args = sys.argv[1:]

if not args or args[0] == '--version':
    print('2.0.0')
    sys.exit(0)

PACKAGES = [
    {'name': 'cockle_fs',  'version': '0.3.0', 'build_string': 'h8b79025_1', 'platform': 'emscripten-wasm32', 'channel': 'https://repo.prefix.dev/emscripten-forge-4x'},
    {'name': 'coreutils',  'version': '9.10',  'build_string': 'h072c4ef_2', 'platform': 'emscripten-wasm32', 'channel': 'https://repo.prefix.dev/emscripten-forge-4x'},
    {'name': 'grep',       'version': '3.12',  'build_string': 'h8b79025_0', 'platform': 'emscripten-wasm32', 'channel': 'https://repo.prefix.dev/emscripten-forge-4x'},
    {'name': 'less',       'version': '693',   'build_string': 'hf259948_0', 'platform': 'emscripten-wasm32', 'channel': 'https://repo.prefix.dev/emscripten-forge-4x'},
    {'name': 'sed',        'version': '4.9',   'build_string': 'h072c4ef_0', 'platform': 'emscripten-wasm32', 'channel': 'https://repo.prefix.dev/emscripten-forge-4x'},
]

print(json.dumps(PACKAGES))
