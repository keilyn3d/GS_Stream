#!/bin/bash
export GS_HOST=0.0.0.0
export GS_DEBUG=true
export GS_SPLAT_MODEL_REPO_PATH=/your/path/to/splat-model-repo


cd ..

python main.py
