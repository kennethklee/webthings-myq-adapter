# webthings-myq-adapter
WebThings MyQ Adapter

# Testing

See Testing the add-on section in https://hacks.mozilla.org/2019/11/ui-extensions-webthings-gateway/

# Release New Version

1. Make a release using `npm version`
2. Push release i.e. `git push origin master v0.1.0`
3. Make a release asset `npm run package` (Also note SHASUM in output)
4. Upload asset
5. Create a pull request in https://github.com/mozilla-iot/addon-list with new `myq-adapter` version.
