import { Component, Input, OnInit } from '@angular/core';
import { axisBottom, axisLeft, curveBasis, line, scaleBand, scaleLinear, scaleOrdinal, scaleTime, select, drag } from 'd3';
import { largestTriangleThreeBucket, modeMedian } from 'd3fc-sample';
import { EventService } from '../services/event.service';


@Component({
  selector: 'app-chart-area',
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.css']
})
export class ChartAreaComponent implements OnInit {

  @Input() videoMetadata;
  @Input() deviceData;
  @Input() instrumentAnnotation;

  private xFramesScale;
  private xTimeScale;

  private svgWidth;
  private innerWidth;
  private margin = { top: 20, bottom: 20, left: 87.88, right: 87.88 };
  private innerHeight = 160;


  // positioning variables for chart area
  private svgElement;
  private svgHeight;
  private chartAreaGroup;
  private innerChartAreaHeight;

  constructor(public eventService: EventService) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.svgHeight = this.innerHeight * 4 + this.margin.top * 4 + this.margin.bottom * 4
    this.svgElement = select('#chart-area-' + this.videoMetadata.name).attr('height', this.svgHeight);
    this.chartAreaGroup = this.svgElement.append('g').attr('transform', `translate(${this.margin.left}, 0)`);
    this.svgWidth = parseFloat(this.svgElement.style('width'));

    this.innerWidth = this.svgWidth - this.margin.left - this.margin.right;

    this.xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);  // x scale is same for all charts
    this.xTimeScale = scaleTime().domain([new Date(0), new Date(this.videoMetadata.duration)]).range([0, this.videoMetadata.numFrames]);
    this.drawDeviceDataGraph();
    this.drawInstrumentAnnotationGraph();
    this.drawPointer();
  }

  private drawInstrumentAnnotationGraph() {

    var labels = ['Grasper', 'Harmonic Scalpel', 'J-hook', 'Ligasure', 'Scissors', 'Stapler', 'Aspirator',
      'Swapholder', 'Silicone Drain', 'Clipper', 'I-Hook', 'Needle Holder'];

    // get scale functions
    var xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    var yScale = scaleBand().domain(labels).range([this.innerHeight, 0])
    var headerScale = scaleOrdinal().domain(this.instrumentAnnotation.columns.slice(1)).range(labels)
    var colorScale = scaleOrdinal().domain(labels)
      .range(["#ff58ab", "#3c5b16", "#5e38b4", "#ff5a09", "#0191bb", "#ff5556", "#91d4ba", "#cd0071", "#ffb555", "#c3baff", "#784543", "#ffabc0"])

    // create group for the graph and move it 
    var group = this.chartAreaGroup.append('g')
      .attr('transform', `translate(0, ${this.margin.top * 4 + this.innerHeight * 3})`)
      .attr('class', `content-${this.videoMetadata.name}`);

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(axisBottom(xFramesScale));

    // add y-axis
    group.append('g')
      .attr('class', 'y-axis')
      .call(axisLeft(yScale));

    // transform data into a better representation
    var transformedData = this.transformInstrumentAnnotation(this.instrumentAnnotation)

    // add bars
    group.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('x', function (d) { return xFramesScale(d.from); })
      .attr('y', function (d) { return yScale(headerScale(d.header)); })
      .attr('width', function (d) { return xFramesScale(d.to - d.from); })
      .attr('fill', function (d) { return colorScale(headerScale(d.header)); })
      .attr('height', yScale.bandwidth());

    // group.append('g')
    //   .attr('class', 'grid')
    //   .call(axisLeft(yScale).ticks(13)
    //     .tickSize(-svgWidth)
    //     .tickFormat('')
    //   )
  }

  private drawDeviceDataGraph() {
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
    var allHeaders = ['currentGasFlowRate', 'targetGasFlowRate', ' currentGasPressure', 'targetGasPressure', 'usedGasVolume', 'gasSupplyPressure', 'deviceOn', 'allLightsOff', 'intensityLight1', 'intensityLight2', 'intensity', 'whiteBalance', 'gains', 'exposureIndex']

    var colorScale = scaleOrdinal()
      .domain(allHeaders)
      .range(['red', 'blue', 'green'])

    graphData.forEach((element, i) => {
      this.drawSingleDeviceDataGraph(i, element.range, element.headers, colorScale)
    });
  }

  private drawSingleDeviceDataGraph(i, range, headers, colorScale) {
    var group = this.chartAreaGroup.append('g')
      .attr('transform', `translate(0, ${this.margin.top * (i + 1) + this.innerHeight * i})`)
      .attr('class', `content-${this.videoMetadata.name}`);
    var xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    var yScale = scaleLinear().domain(range).range([this.innerHeight, 0])

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(axisBottom(xFramesScale));

    // add y-axis
    group.append('g')
      .attr('class', 'y-axis')
      .call(axisLeft(yScale));

    var nestedData = headers.map((header) =>
      ({
        header: header, values: this.applyMeanDownsampling(this.deviceData.map((row) =>
          ({ frame: row.frame, value: row[header] })))
      }));

    // draw line
    var lineGenerator = line()
      .x(function (d, i) { return xFramesScale(d.frame); })
      .y(function (d, i) { return yScale(d.value); })
      .curve(curveBasis);  // curve interpolation

    group.selectAll('.line-path')
      .data(nestedData).enter().append('path')
      .attr('class', (d) => `${d.header}-${this.videoMetadata.name}`)
      .attr('d', d => lineGenerator(d.values))
      .style('fill', 'none')
      .style('stroke', (d) => colorScale(d.header))
      .style('stroke-width', '1')
      .style('stroke-linejoin', 'round')
      .style('mix-blend-mode', 'multiply');
  }



  // TODO: maybe it is possible to do it with d3?
  private transformInstrumentAnnotation(data) {
    var result = [];
    for (var header of this.instrumentAnnotation.columns.slice(1)) {  // iterate over headers (omit column 'Frame')
      var previousVisible = false;
      var from = 0;
      var to = 0;
      for (var row of data) {  // iterate over instrumentAnnotation rows
        if (row[header] == 1 && !previousVisible) {  // values for instrument is 1 and it is the first one
          previousVisible = true;
          from = row['Frame']
        } else if (row[header] == 0 && previousVisible) {  // instrument is not visible anymore
          to = row['Frame']
          previousVisible = false
          result.push({ 'header': header, 'from': from, 'to': to })
        }
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
    sampler.bucketSize(1000);
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

  private drawPointer() {
    var xPos = select(`.pointer-${this.videoMetadata.name}`).attr('x1');
    var pointer = this.chartAreaGroup.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr("x1", xPos)
      .attr("y1", 0)
      .attr("x2", xPos)
      .attr("y2", this.svgHeight)
      .attr("stroke-width", "3")
      .attr("stroke", "gray");

    // add drag behavior for pointer element
    pointer.call(drag().on('drag', () => this.eventService.dragBehavior(this.videoMetadata.name, this.chartAreaGroup, this.innerWidth, this.margin.left, 70, this.xFramesScale, this.xTimeScale)));

    // add click behavior for svg element
    this.svgElement.on('click', () => this.eventService.clickBehavior(this.videoMetadata.name, this.chartAreaGroup, this.innerWidth, this.margin.left, 70, this.xFramesScale, this.xTimeScale));
  }



}