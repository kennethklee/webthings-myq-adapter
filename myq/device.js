const {
  Device,
  Property,
} = require('gateway-addon')

const PROPERTY_DEFINITIONS = {
  open: {
    title: 'Door',
    type: 'boolean',
    '@type': 'DoorProperty'
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
    this.type = host.typeName
    this['@type'] = ['DoorSensor']

    let doorProperty = new Property(this, 'open', PROPERTY_DEFINITIONS.open)
    doorProperty.setCachedValue(host.doorState === 1)
    this.properties.set('open', doorProperty)

    this.retry = 0
    this.poll()
  }

  notifyPropertyChanged(property) {
    super.notifyPropertyChanged(property)
    switch (property.name) {
      case 'open':
        this.toggle(property.value)
        break
    }
  }

  async poll() {
    this._pollSchedule = setTimeout(() => this.poll(), this.adapter.pollInterval * 60 * 1000)

    let resp = await this.adapter.myq.getDoorState(this.id)
    if (resp.returnCode) {
      console.error('Abort:', resp.message)
      return this.cancelPoll()
    }
    console.log(this.name, 'reports', resp.doorStateDescription)
    
    let newValue = resp.doorState === 1

    let doorProp = this.properties.get('open')
    if (doorProp.value !== newValue) {
      doorProp.setCachedValue(newValue)
      this.notifyPropertyChanged(doorProp)     
    }
  }

  async cancelPoll() {
    clearTimeout(this._pollSchedule)
  }

  async toggle(isOpen) {
    if (isOpen === undefined) {
      isOpen = !this.properties.get('open').value
    }

    let resp = await this.adapter.myq.setDoorState(this.id, isOpen ? 1 : 0)
    
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