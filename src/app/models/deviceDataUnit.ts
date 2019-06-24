export class DeviceDataUnit {
  frame: number
  thermoCurrGasFlow: number
  thermoTarGasFlow: number
  thermoCurrGasPress: number
  thermoTarGasPress: number
  thermoGasVol: number
  thermoGasSupplPres: number
  thermoDeviceOn: number
  orLightsOff: number
  orLightsIntLight1: number
  orLightsIntLight2: number
  endLightSourceIntens: number
  endWhiteBal: number
  endGains: number
  endExposureIndex: number

  constructor(frame: string, thermoCurrGasFlow: string, thermoTarGasFlow: string, thermoCurrGasPress: string,
    thermoTarGasPress: string,
    thermoGasVol: string,
    thermoGasSupplPres: string,
    thermoDeviceOn: string,
    orLightsOff: string,
    orLightsIntLight1: string,
    orLightsIntLight2: string,
    endLightSourceIntens: string,
    endWhiteBal: string,
    endGains: string,
    endExposureIndex: string) {
    this.frame = parseInt(frame);
    this.thermoCurrGasFlow = parseInt(thermoCurrGasFlow)
    this.thermoTarGasFlow = parseInt(thermoTarGasFlow)
    this.thermoCurrGasPress = parseInt(thermoCurrGasPress)
    this.thermoTarGasPress = parseInt(thermoTarGasPress)
    this.thermoGasVol = parseInt(thermoGasVol)
    this.thermoGasSupplPres = parseInt(thermoGasSupplPres)
    this.thermoDeviceOn = parseInt(thermoDeviceOn)
    this.orLightsOff = parseInt(orLightsOff)
    this.orLightsIntLight1 = parseInt(orLightsIntLight1)
    this.orLightsIntLight2 = parseInt(orLightsIntLight2)
    this.endLightSourceIntens = parseInt(endLightSourceIntens)
    this.endWhiteBal = parseInt(endWhiteBal)
    this.endGains = parseInt(endGains)
    this.endExposureIndex = parseInt(endExposureIndex)
  }
}