const {
  Adapter
} = require('gateway-addon')

let MyQ = require('myq-api')
let MyQDevice = require('./device')


class MyQAdapter extends Adapter {
  constructor(addonManager, config, manifest) {
    super(addonManager, manifest.id, manifest.name)

    this.myq = new MyQ(config.email, config.password)
    this.pollInterval = config.pollInterval
    
    addonManager.addAdapter(this)

    this.myq.login()
      .then(result => {
        if (result.returnCode) {
          throw new Error(result.message)
        }
        return this.myq.getDevices([7, 17])
      })
      .then(result => {
        if (result.returnCode) {
          throw new Error(result.message)
        }
        result.devices.forEach(device => {
          this.handleDeviceAdded(new MyQDevice(this, device))
        })
      })
  }

  /**
   * Start the pairing/discovery process.
   *
   * @param {Number} timeoutSeconds Number of seconds to run before timeout
   */
  async startPairing(_timeoutSeconds) {
    console.log('MyQAdapter:', this.name, 'id', this.id, 'pairing started')
    
    let result = await this.myq.getDevices([7, 17])
    if (result.returnCode) {
      throw new Error(result.message)
    }

    result.devices.forEach(device => {
      this.handleDeviceAdded(new MyQDevice(this, device))
    })
  }

  /**
   * Unpair the provided the device from the adapter.
   *
   * @param {Object} device Device to unpair with
   */
  removeThing(device) {
    console.log('MyQAdapter:', this.name, 'id', this.id,
                'removeThing(', device.id, ') started');

    const device = this.devices[deviceId]
    if (device) {
      device.stopPolling()
      this.handleDeviceRemoved(device)
      console.log('MyQAdapter: device, ', device.id, ', was unpaired.')
    } else {
      console.error('MyQAdapter: device, ', device.id, ', not found.')
    }
  }
}

module.exports = MyQAdapter