#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-to-do-list-93492-93501/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

