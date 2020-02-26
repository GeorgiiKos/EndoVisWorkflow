import { Component, Input, OnInit, ɵɵNgOnChangesFeature } from '@angular/core';
import { axisBottom, axisLeft, curveBasis, line, scaleBand, scaleLinear, scaleOrdinal, select, mean, range, event, schemeSet3, selectAll } from 'd3';
import { largestTriangleThreeBucket, modeMedian } from 'd3fc-sample';


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


  public dataLoaded = false;

  private labels = ['Grasper', 'Harmonic Scalpel', 'J-hook', 'Ligasure', 'Scissors', 'Stapler', 'Aspirator',
    'Swapholder', 'Silicone Drain', 'Clipper', 'I-Hook', 'Needle Holder'];

  // positioning variables
  private svgElement;


  private barHeight = 35;
  private barMargin = { top: 10, bottom: 10, left: 87.88, right: 87.88 };

  private svgWidth;
  private graphHeight = 160;

  private svgHeight = this.barHeight + this.graphHeight * 4;
  private margin = { top: 5, bottom: 20, left: 87.88, right: 87.88 };

  private innerWidth;
  private innerHeight;

  private commonGroup;


  constructor() { }

  ngOnInit() {

  }

  ngOnChanges() {
    if (!this.dataLoaded && this.deviceData && this.instrumentAnnotation) {
      this.dataLoaded = true;
      this.svgElement.attr('height', this.barHeight + this.graphHeight * 4)
      this.drawDeviceDataGraph();
      this.drawInstrumentAnnotationGraph();
      this.drawPointer();
    }
  }

  ngAfterViewInit() {
    this.svgElement = select('#charts-' + this.videoMetadata.name);
    this.svgWidth = parseFloat(this.svgElement.style('width'));

    this.innerWidth = this.svgWidth - this.margin.left - this.margin.right;
    this.innerHeight = this.graphHeight - this.margin.top - this.margin.bottom;

    this.commonGroup = this.svgElement.append('g').attr('transform', `translate(${this.margin.left}, 0)`)


    // this.drawPhaseBar();
  }

  private drawInstrumentAnnotationGraph() {

    // get scale functions
    var xScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    var yScale = scaleBand().domain(this.labels).range([this.innerHeight, 0])
    var headerScale = scaleOrdinal().domain(this.instrumentAnnotation.columns.slice(1)).range(this.labels)
    var colorScale = scaleOrdinal().domain(this.labels)
      .range(["#ff58ab", "#3c5b16", "#5e38b4", "#ff5a09", "#0191bb", "#ff5556", "#91d4ba", "#cd0071", "#ffb555", "#c3baff", "#784543", "#ffabc0"])

    // create group for the graph and move it 
    var group = this.commonGroup.append('g')
      .attr('transform', `translate(0, ${this.margin.top + this.graphHeight * 3 + this.barHeight})`)
      .attr('class', `content-${this.videoMetadata.name}`);

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(axisBottom(xScale));

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
      .attr('x', function (d) { return xScale(d.from); })
      .attr('y', function (d) { return yScale(headerScale(d.header)); })
      .attr('width', function (d) { return xScale(d.to - d.from); })
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
    var group = this.commonGroup.append('g')
      .attr('transform', `translate(0, ${this.margin.top + this.graphHeight * i + this.barHeight})`)
      .attr('class', `content-${this.videoMetadata.name}`);
    var xScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    var yScale = scaleLinear().domain(range).range([this.innerHeight, 0])

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(axisBottom(xScale));

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
      .x(function (d, i) { return xScale(d.frame); })
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

  public showContent() {
    selectAll(`.content-${this.videoMetadata.name}`).style('display', 'block')
    this.svgElement.attr("height", this.svgHeight);
  }

  public hideContent() {
    selectAll(`.content-${this.videoMetadata.name}`).style('display', 'none')
    this.svgElement.attr("height", this.barHeight);
  }

  private drawPointer() {
    var pointer = this.commonGroup.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.svgHeight)
      .attr("stroke-width", "3")
      .attr("stroke", "dimgray");
  }

}
