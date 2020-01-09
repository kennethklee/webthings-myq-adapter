const manifest = require('./manifest.json')
const {MyQAdapter} = require('./myq')
const {Database} = require('gateway-addon')

module.exports = async (addonManager) => {
  let db = new Database(manifest.id)
  let config = await db.open().then(() => db.loadConfig())

  new MyQAdapter(addonManager, config, manifest)
}
