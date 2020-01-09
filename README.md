# webthings-myq-adapter
WebThings MyQ Adapter

# Testing

See Testing the add-on section in https://hacks.mozilla.org/2019/11/ui-extensions-webthings-gateway/

# Release New Version

1. Manually bump version in `manifest.json`
2. Make a release using `npm version`
3. Push release i.e. `git push origin master v0.1.0`
4. Make a release asset `npm run package` (Also note SHASUM in output)
5. Upload tgz asset
6. Create a pull request in https://github.com/mozilla-iot/addon-list with new `myq-adapter` version
