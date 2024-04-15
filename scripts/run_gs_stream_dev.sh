#!/bin/bash
export GS_CONFIG_PATH=./output/dab812a2-1/point_cloud/iteration_30000/config.yaml
export GS_HOST=0.0.0.0
export GS_DEBUG=true

cd ..

python main.py
