import { Injectable } from '@angular/core';
import { range, scaleOrdinal } from 'd3';


@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  phaseAnnotationColorScale = scaleOrdinal()
    .domain(range(14))
    .range(["#c85c9f", "#71d14b", "#b249d3", "#d0cb50", "#868ac3", "#79cc91", "#ae4248", "#7abcc5", "#d36b34", "#5741a6", "#797d37", "#4d2d47", "#cfae9b", "#42513b"]);

  deviceDataColorScale = scaleOrdinal()
    .domain(['currentGasFlowRate', 'targetGasFlowRate', 'currentGasPressure', 'targetGasPressure', 'usedGasVolume', 'gasSupplyPressure', 'deviceOn', 'allLightsOff', 'intensityLight1', 'intensityLight2', 'intensity', 'whiteBalance', 'gains', 'exposureIndex'])
    .range(["red", "lime", "indigo", "darkgreen", "blue", "yellow", "fuchsia", "mediumspringgreen", "saddlebrown", "#45b0cf", "aqua", "orange", "slategray", "black"]);

  instrumentAnnotationHeaderScale = scaleOrdinal()
    .domain(['Grasper', 'HarmonicScalpel', 'J-hook', 'Ligasure', 'Scissors', 'Stapler', 'Aspirator', 'Swapholder', 'SiliconeDrain', 'Clipper', 'I-Hook', 'NeedleHolder'])
    .range(['Grasper', 'Harmonic Scalpel', 'J-hook', 'Ligasure', 'Scissors', 'Stapler', 'Aspirator', 'Swapholder', 'Silicone Drain', 'Clipper', 'I-Hook', 'Needle Holder']);

  instrumentAnnotationColorScale = scaleOrdinal()
    .domain(['Grasper', 'HarmonicScalpel', 'J-hook', 'Ligasure', 'Scissors', 'Stapler', 'Aspirator', 'Swapholder', 'SiliconeDrain', 'Clipper', 'I-Hook', 'NeedleHolder'])
    .range(["#ff58ab", "#3c5b16", "#5e38b4", "#ff5a09", "#0191bb", "#ff5556", "#91d4ba", "#cd0071", "#ffb555", "#c3baff", "#784543", "#ffabc0"]);

  constructor() { }
}
