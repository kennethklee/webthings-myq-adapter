const {
  Device,
  Property,
} = require('gateway-addon')

const PROPERTY_DEFINITIONS = {
  open: {
    title: 'Open',
    type: 'boolean',
    '@type': 'OpenProperty',
    readOnly: true,
  }
}

const ABORT_RETRY = 2

function wait(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {resolve()}, milliseconds)
  })
}

class MyQDevice extends Device {
  constructor(adapter, host) {
    super(adapter, host.id)

    this.id = host.id
    this.name = host.name
    this['@type'] = ['DoorSensor']

    const openProperty = new Property(this, 'open', PROPERTY_DEFINITIONS.open)
    openProperty.setCachedValue(host.doorState === 1)
    this.properties.set('open', openProperty)

    this.addAction(
      'open',
      {
        title: 'Open',
        description: 'Open the door',
      }
    )

    this.addAction(
      'close',
      {
        title: 'Close',
        description: 'Close the door',
      }
    )

    this.retry = 0
    this.poll()
  }

  async poll() {
    this._pollSchedule = setTimeout(() => this.poll(), this.adapter.pollInterval * 60 * 1000)

    const resp = await this.adapter.myq.getDoorState(this.id)
    if (resp.returnCode) {
      console.error('Abort:', resp.message)
      return this.cancelPoll()
    }
    console.log(this.name, 'reports', resp.doorStateDescription)
    
    const newValue = resp.doorState === 1

    const openProp = this.properties.get('open')
    if (openProp.value !== newValue) {
      openProp.setCachedValue(newValue)
      this.notifyPropertyChanged(openProp)     
    }
  }

  async cancelPoll() {
    clearTimeout(this._pollSchedule)
  }

  async performAction(action) {
    action.start()

    switch (action.name) {
      case 'open':
        await this.toggle(true)
        break
      case 'close':
        await this.toggle(false)
        break
    }

    action.finish()
  }

  async toggle(isOpen) {
    if (typeof isOpen === 'undefined') {
      isOpen = !this.properties.get('open').value
    }

    const resp = await this.adapter.myq.setDoorState(this.id, isOpen ? 1 : 0)
    
    if (resp.returnCode === 13) {
      this.retry++
      if (this.retry > ABORT_RETRY) {
        console.warn('Failed to login. Aborting.')
        return
      }
      console.warn('MyQ unauthorized, logging in and trying again in 1 second.')
      await wait(1000)
      await this.adapter.login()
      return this.toggle(isOpen)
    } else {
      console.log(this.name, isOpen ? 'opening' : 'closing')
      this.retry = 0    // reset retry
    }
  }
}

module.exports = MyQDevice
