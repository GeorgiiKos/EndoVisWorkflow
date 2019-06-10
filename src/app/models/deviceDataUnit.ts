export class DeviceDataUnit {
  frame: Number
  thermoCurrGasFlow: Number
  thermoTarGasFlow: Number
  thermoCurrGasPress: Number
  thermoTarGasPress: Number
  thermoGasVol: Number
  thermoGasSupplPres: Number
  thermoDeviceOn: Number
  orLightsOff: Number
  orLightsIntLight1: Number
  orLightsIntLight2: Number
  endLightSourceIntens: Number
  endWhiteBal: Number
  endGains: Number
  endExposureIndex: Number

  constructor(frame: Number, thermoCurrGasFlow: Number, thermoTarGasFlow: Number, thermoCurrGasPress: Number,
    thermoTarGasPress: Number,
    thermoGasVol: Number,
    thermoGasSupplPres: Number,
    thermoDeviceOn: Number,
    orLightsOff: Number,
    orLightsIntLight1: Number,
    orLightsIntLight2: Number,
    endLightSourceIntens: Number,
    endWhiteBal: Number,
    endGains: Number,
    endExposureIndex: Number) {
      this.frame = frame;
      this.thermoCurrGasFlow = thermoCurrGasFlow
      this.thermoTarGasFlow = thermoTarGasFlow
      this.thermoCurrGasPress = thermoCurrGasPress
      this.thermoTarGasPress = thermoTarGasPress
      this.thermoGasVol = thermoGasVol
      this.thermoGasSupplPres = thermoGasSupplPres
      this.thermoDeviceOn = thermoDeviceOn
      this.orLightsOff = orLightsOff
      this.orLightsIntLight1 = orLightsIntLight1
      this.orLightsIntLight2 = orLightsIntLight2
      this.endLightSourceIntens = endLightSourceIntens
      this.endWhiteBal = endWhiteBal
      this.endGains = endGains
      this.endExposureIndex = endExposureIndex
    }
}