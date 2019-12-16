const {
  Device,
  // Property,
} = require('gateway-addon')

const PROPERTY_DEFINITIONS = {
  // online: {
  //   title: 'On/Off',
  //   type: 'boolean',
  //   '@type': 'OnOffProperty',
  // },
  door: {
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
    this['@type'] = 'DoorSensor'
    
    let doorProperty = new Property(this, 'door', PROPERTY_DEFINITIONS.door)
    doorProperty.setCachedValue(host.doorState === 1)
    this.properties.set('door', doorProperty)
  }

  async notifyPropertyChanged(property) {
    super.notifyPropertyChanged(property)

    switch (property) {
      case 'door':
        return adapter.myq.setDoorState(this.id, property.value ? 2 : 1)
    }
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