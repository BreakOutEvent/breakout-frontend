#!/usr/bin/env bash

node-inspector --no-preload --hidden=node_modules/ env NODE_ENVIRONMENT=prod nodemon --debug app.js