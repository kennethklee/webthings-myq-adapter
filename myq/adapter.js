const {
  Adapter
} = require('gateway-addon')

let MyQ = require('myq-api')
let MyQDevice = require('./device')


class MyQAdapter extends Adapter {
  constructor(addonManager, config, manifest) {
    super(addonManager, manifest.id, manifest.name)

    this.myq = new MyQ(config.username, config.password)
    this.pollInterval = config.pollInterval

    addonManager.addAdapter(this)
  }

  /**
   * Start the pairing/discovery process.
   *
   * @param {Number} timeoutSeconds Number of seconds to run before timeout
   */
  async startPairing(_timeoutSeconds) {
    console.log('MyQAdapter:', this.name, 'id', this.id, 'pairing started')

    if (!this.myq.securityToken) {
      await this.myq.login()
    }

    let {devices} = this.myq.getDevices([7, 17]) // Retrieve garage doors
    devices.forEach(device => {
      this.handleDeviceAdded(new MyQDevice(this, device))
    })
  }

  /**
   * Cancel the pairing/discovery process.
   */
  cancelPairing() {
    console.log('MyQAdapter:', this.name, 'id', this.id,
                'pairing cancelled');
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

  /**
   * Cancel unpairing process.
   *
   * @param {Object} device Device that is currently being paired
   */
  cancelRemoveThing(device) {
    console.log('MyQAdapter:', this.name, 'id', this.id,
                'cancelRemoveThing(', device.id, ')');
  }

  /**
   * Gateway saves device (or loads device)
   * 
   * @param {string} deviceId - ID of the device
   * @param {object} device - the saved device description
   */
  handleDeviceSaved(deviceId, device) {
    console.log('MyQAdapter:', this.name, 'id', this.id,
                'handleDeviceSaved(', device.id, ')');

    this.devices[device.id].poll() // Start polling
  }
}

module.exports = MyQAdapter