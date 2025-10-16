#!/bin/bash
cd /home/kavia/workspace/code-generation/airpods-max-showcase-176212-176221/web_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

