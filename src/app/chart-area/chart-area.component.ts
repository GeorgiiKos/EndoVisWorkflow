import { Component, Input, NgZone, OnInit } from '@angular/core';
import { axisBottom, axisLeft, curveBasis, drag, line, scaleBand, scaleLinear, scaleTime, select } from 'd3';
import { largestTriangleThreeBucket, modeMedian } from 'd3fc-sample';
import { PointerService } from '../services/pointer.service';
import { PositioningService } from '../services/positioning.service';
import { ScaleService } from '../services/scale.service';

@Component({
  selector: 'app-chart-area',
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.css']
})
export class ChartAreaComponent implements OnInit {

  @Input() videoMetadata;
  @Input() deviceData;
  @Input() instrumentAnnotation;
  @Input() phaseAnnotation;

  constructor(public pointerService: PointerService, private positioning: PositioningService, private scales: ScaleService, private zone: NgZone) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var svgElement = select('#chart-area-' + this.videoMetadata.name).attr('height', this.positioning.chartAreaHeight);  // set height of svg container
    var globalGroup = svgElement.append('g').attr('transform', `translate(${this.positioning.marginLeft}, 0)`);
    var svgWidth = parseFloat(svgElement.style('width'));  // get svg width

    var innerWidth = svgWidth - this.positioning.marginLeft - this.positioning.marginRight;  // calculate width of a single graph

    // get x scales
    var xFrameScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, innerWidth]);
    var xTimeScale = scaleTime().domain([0, this.videoMetadata.numFrames]).range([new Date(0), new Date(this.videoMetadata.duration)]);

    this.drawDeviceDataGraph(globalGroup, innerWidth, xFrameScale);
    this.drawInstrumentAnnotationGraph(globalGroup, innerWidth, xFrameScale);
    this.drawPointer(globalGroup, svgElement, innerWidth, xFrameScale, xTimeScale);
  }

  private drawDeviceDataGraph(globalGroup, innerWidth, xFrameScale) {
    var graphData = [
      {
        range: [-1, 300],
        headers: ['currentGasFlowRate', 'targetGasFlowRate', 'currentGasPressure', 'targetGasPressure', 'intensityLight1', 'intensityLight2', 'intensity']
      },
      {
        range: [-1, 7500],
        headers: ['usedGasVolume', 'gasSupplyPressure', 'gains', 'exposureIndex']
      },
      {
        range: [-1, 1],
        headers: ['deviceOn', 'allLightsOff', 'whiteBalance']
      }
    ]

    graphData.forEach((element, i) => {
      this.drawSingleDeviceDataGraph(globalGroup, innerWidth, xFrameScale, i, element.range, element.headers, this.scales.deviceDataColorScale)
    });
  }

  private drawSingleDeviceDataGraph(globalGroup, innerWidth, xFrameScale, i, range, headers, colorScale) {
    var group = globalGroup.append('g')
      .attr('transform', `translate(0, ${this.positioning.calcChartAreaYPos(i)})`)
      .attr('class', `content-${this.videoMetadata.name}`);
    var yScale = scaleLinear().domain(range).range([this.positioning.chartAreaInnerHeight[i], 0])

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.positioning.chartAreaInnerHeight[i]})`)
      .call(axisBottom(xFrameScale));

    // add grid lines
    group.append('g')
      .attr('class', 'grid')
      .call(axisLeft(yScale)
        .tickSize(-innerWidth)
        .ticks(this.positioning.chartAreaTicks[i])
        .tickFormat(''))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('line').remove())  // remove first line
      .selectAll('line')
      .style('stroke', '#ededed');

    // add y-axis
    group.append('g')
      .attr('class', 'y-axis')
      .call(axisLeft(yScale).ticks(this.positioning.chartAreaTicks[i]));

    var nestedData = headers.map((header) =>
      ({
        header: header, values: this.applyMeanDownsampling(this.deviceData.map((row) =>
          ({ frame: row.frame, value: row[header] })))
      }));

    // draw line
    var lineGenerator = line()
      .x(function (d, i) { return xFrameScale(d.frame); })
      .y(function (d, i) { return yScale(d.value); })
      .curve(curveBasis);  // curve interpolation

    var paths = group.selectAll('.line-path')
      .data(nestedData).enter().append('path')
      .attr('id', (d) => `${d.header}-${this.videoMetadata.name}`)
      .attr('class', (d) => `line-${this.videoMetadata.name}`)
      .attr('d', d => lineGenerator(d.values))
      .style('fill', 'none')
      .style('stroke', (d) => colorScale(d.header))
      .style('stroke-width', '1')
      .style('stroke-linejoin', 'round')
      .style('mix-blend-mode', 'multiply');

    paths.filter((d) => d.header !== 'currentGasFlowRate').attr('visibility', 'hidden')
  }

  private drawInstrumentAnnotationGraph(globalGroup, innerWidth, xFrameScale) {
    // get scale functions
    var yScale = scaleBand().domain(this.scales.instrumentAnnotationHeaderScale.range()).range([this.positioning.chartAreaInnerHeight[3], 0])

    // create group for the graph and move it 
    var group = globalGroup.append('g')
      .attr('transform', `translate(0, ${this.positioning.calcChartAreaYPos(3)})`)
      .attr('class', `content-${this.videoMetadata.name}`);

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.positioning.chartAreaInnerHeight[3]})`)
      .call(axisBottom(xFrameScale));

    // add grid lines
    group.append('g')
      .attr('class', 'grid')
      .call(axisLeft(yScale)
        .tickSize(-innerWidth)
        .ticks(this.positioning.chartAreaTicks[3])
        .tickFormat(''))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('line').remove())  // remove first line
      .attr('transform', `translate(0, ${yScale.bandwidth() / 2})`)
      .selectAll('line')
      .style('stroke', '#ededed');

    // add y-axis
    group.append('g')
      .attr('class', 'y-axis y-axis-instrumentAnnotation')
      .call(axisLeft(yScale));

    // transform data into a better representation
    var transformedData = this.transformInstrumentAnnotation(this.instrumentAnnotation)

    // add bars
    group.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('class', (d) => `instrument-${this.videoMetadata.name} ${d.header}`)
      .attr('x', (d) => xFrameScale(d.from))
      .attr('y', (d) => yScale(this.scales.instrumentAnnotationHeaderScale(d.header)))
      .attr('width', (d) => xFrameScale(d.to - d.from))
      .attr('fill', (d) => this.scales.instrumentAnnotationColorScale(d.header))
      .attr('height', yScale.bandwidth());
  }

  private drawPointer(globalGroup, svgElement, innerWidth, xFrameScale, xTimeScale) {
    var xPos = parseFloat(select(`.pointer-${this.videoMetadata.name}`).attr('x1'));
    var pointer = globalGroup.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr("x1", xPos)
      .attr("y1", 0)
      .attr("x2", xPos)
      .attr("y2", this.positioning.chartAreaHeight)
      .attr("stroke-width", this.positioning.pointerWidth)
      .attr("stroke", "gray");

    // initial instrument highlighting
    var frameNr = Math.round(xFrameScale.invert(xPos));  // calculate frame number
    this.pointerService.highlightInsturments(this.videoMetadata.name, frameNr);

    // add event listeners outside angular change detection zone
    this.zone.runOutsideAngular(() => {
      // add drag behavior for pointer element
      pointer.call(drag().on('drag', () => this.pointerService.movePointer(this.videoMetadata.name, globalGroup, innerWidth, this.videoMetadata.frameSamplingRate, this.videoMetadata.frameWidth, this.phaseAnnotation, xFrameScale, xTimeScale)));

      // add click behavior for svg element
      svgElement.on('click', () => this.pointerService.movePointer(this.videoMetadata.name, globalGroup, innerWidth, this.videoMetadata.frameSamplingRate, this.videoMetadata.frameWidth, this.phaseAnnotation, xFrameScale, xTimeScale));
    });
  }

  // TODO: maybe it is possible to do it with d3?
  private transformInstrumentAnnotation(data) {
    var result = [];
    for (var header of this.instrumentAnnotation.columns.slice(1)) {  // iterate over headers (omit column 'Frame')
      var previousVisible = false;
      var from = 0;
      var to = 0;
      var previousFrameNr = 0;
      for (var row of data) {  // iterate over instrumentAnnotation rows
        if (row[header] == 1 && !previousVisible) {  // values for instrument is 1 and it is the first one
          previousVisible = true;
          from = row['Frame']
        } else if (previousVisible && previousFrameNr + 1500 != row['Frame']) {  // missing data
          to = previousFrameNr + 1500
          previousVisible = false
          result.push({ 'header': header, 'from': from, 'to': to })
        } else if (row[header] == 0 && previousVisible) {  // instrument is not visible anymore
          to = row['Frame']
          previousVisible = false
          result.push({ 'header': header, 'from': from, 'to': to })
        }
        previousFrameNr = row['Frame']
      }
    }
    return result
  }

  // mean downsampling
  private applyMeanDownsampling(data) {
    // var binSize = 200;
    // var result = [];
    // for (var i = 0; i < data.length; i += binSize) {
    //   var slice = data.slice(i, i + binSize).map(d => d.value);
    //   var meanValue = mean(slice)
    //   result.push({ frame: i + binSize / 2, value: meanValue })
    // }
    // return result;

    var sampler = modeMedian();
    sampler.bucketSize(100);
    sampler.value(d => d.value);
    var result = sampler(data);
    return result;
  }

  // largest triangle three buckets algorithm 
  private applyLTTB(data) {
    var sampler = largestTriangleThreeBucket();
    sampler.x(d => d.frame).y(d => d.value);
    sampler.bucketSize(10);
    var result = sampler(data);
    return result;
  }

}
