const {
  Adapter
} = require('gateway-addon')

const MyQ = require('myq-api')
const MyQDevice = require('./device')


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
    console.log(this.name, 'pairing started')
    
    const result = await this.myq.getDevices([7, 17])
    if (result.returnCode) {
      throw new Error(result.message)
    }

    result.devices.forEach(device => {
      this.handleDeviceAdded(new MyQDevice(this, device))
    })
    console.log(this.name, 'paired', result.devices.length, 'devices')
  }

  /**
   * Unpair the provided the device from the adapter.
   *
   * @param {Object} device Device to unpair with
   */
  removeThing(device) {
    console.log(this.name, 'removeThing(', device.id, ') started')

    const myQDevice = this.devices[device.id]
    if (myQDevice) {
      myQDevice.cancelPoll()
      this.handleDeviceRemoved(myQDevice)
      console.log(this.name, 'device', device.id, ' was removed')
    } else {
      console.error(this.name, 'device ', device.id, ' not found for removal')
    }
  }
}

module.exports = MyQAdapter
