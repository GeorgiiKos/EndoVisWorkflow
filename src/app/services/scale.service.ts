import { Injectable } from '@angular/core';
import { axisBottom, axisLeft, curveBasis, drag, line, scaleBand, scaleLinear, scaleOrdinal, scaleTime, select } from 'd3';


@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  deviceDataColorScale = scaleOrdinal()
    .domain(['currentGasFlowRate', 'targetGasFlowRate', 'currentGasPressure', 'targetGasPressure', 'usedGasVolume', 'gasSupplyPressure', 'deviceOn', 'allLightsOff', 'intensityLight1', 'intensityLight2', 'intensity', 'whiteBalance', 'gains', 'exposureIndex'])
    .range(["red", "lime", "indigo", "darkgreen", "blue", "yellow", "fuchsia", "mediumspringgreen", "saddlebrown", "#45b0cf", "aqua", "orange", "slategray", "black"]);

  constructor() { }
}
