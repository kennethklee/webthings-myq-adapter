const {
  Device,
  Property,
} = require('gateway-addon')

const PROPERTY_DEFINITIONS = {
  // online: {
  //   title: 'On/Off',
  //   type: 'boolean',
  //   '@type': 'OnOffProperty',
  // },
  open: {
    title: 'Door',
    type: 'boolean',
    '@type': 'DoorProperty'
  },
  // state: {
  //   title: 'State',
  //   type: 'string',
  //   enum: ['open', 'closed', 'stopped in the middle', 'going up', 'going down', 'not closed']
  // }
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

    this.poll()
  }

  async notifyPropertyChanged(property) {
    switch (property.name) {
      case 'open':
        console.log('Setting door state to', property.value ? 1 : 2)
        await this.adapter.myq.setDoorState(this.id, property.value ? 1 : 2)
        break
    }

    super.notifyPropertyChanged(property)
  }

  async poll() {
    this._pollSchedule = setTimeout(() => this.poll(), this.adapter.pollInterval)

    let resp = await this.adapter.myq.getDoorState(this.id)
    let newValue = resp.doorState === 1

    if (this.properties.door.value !== newValue) {
      this.properties.door.set_cached_value(newValue)
      this.notify_property_changed(this.properties.door)
    }
  }

  async cancelPoll() {
    clearTimeout(this._pollSchedule)
  }
}
module.exports = MyQDevice