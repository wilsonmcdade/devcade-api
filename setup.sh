#!/bin/bash
npm install
npm audit fix
cd pythonScripts
python -m pip install -r requirements.txt
npm run run
# read -p "Press any key..."