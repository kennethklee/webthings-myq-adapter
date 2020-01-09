#!/bin/bash

mv node_modules node_modules.bak  # backup node_modules

echo 'Generating package...'
npm install --production
rm -f SHA256SUMS
sha256sum manifest.json package.json *.js LICENSE **/*.js README.md > SHA256SUMS
rm -rf node_modules/.bin
find node_modules -type f -exec sha256sum {} \; >> SHA256SUMS
TARFILE=$(npm pack)
tar xzf ${TARFILE}
mv node_modules package
tar czf ${TARFILE} package
rm -rf package
mv node_modules.bak node_modules  # restore node_modules
sha256sum --tag ${TARFILE}
echo "Created package, ${TARFILE}"
