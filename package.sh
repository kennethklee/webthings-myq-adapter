#!/bin/bash

rm -f SHA256SUMS
sha256sum manifest.json package.json *.js **/*.js README.md > SHA256SUMS
npm pack