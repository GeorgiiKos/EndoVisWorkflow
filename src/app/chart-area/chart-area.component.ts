import { Component, Input, OnInit } from '@angular/core';
import { axisBottom, axisLeft, curveBasis, drag, line, scaleTime, mouse, range, scaleBand, scaleLinear, scaleOrdinal, select, selectAll } from 'd3';
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

  private xFramesScale;
  private xTimeScale;

  private labels = ['Grasper', 'Harmonic Scalpel', 'J-hook', 'Ligasure', 'Scissors', 'Stapler', 'Aspirator',
    'Swapholder', 'Silicone Drain', 'Clipper', 'I-Hook', 'Needle Holder'];

  private svgWidth;
  private innerWidth;
  private marginX = { left: 87.88, right: 87.88 };


  // positioning variables for bar chart
  private barChartSvg;
  private barChartMarginY = { top: 70, bottom: 5 };
  private barChartSvgHeight;
  private barChartHeight = 35;
  private barChartGroup;
  private innerBarChartHeight;

  // positioning variables for chart area
  private chartAreaSvg;
  private chartAreaMarginY = { top: 5, bottom: 20 };
  private chartAreaSvgHeight;
  private graphHeight = 160;
  private chartAreaGroup;
  private innerChartAreaHeight;

  // image
  private image;
  private imageFrame;
  private imageFrameTip;
  private imageFrameInfo;

  constructor() { }

  ngOnInit() {

  }

  // ngOnChanges() {
  //   if (!this.dataLoaded && this.deviceData && this.instrumentAnnotation) {
  //     this.dataLoaded = true;
  //     this.svgElement.attr('height', this.barHeight + this.graphHeight * 4)
  //     this.drawDeviceDataGraph();
  //     this.drawInstrumentAnnotationGraph();
  //     this.drawPointer();
  //   }
  // }

  ngAfterViewInit() {
    this.barChartSvg = select('#bar-chart-' + this.videoMetadata.name);
    this.chartAreaSvg = select('#chart-area-' + this.videoMetadata.name);

    this.barChartGroup = this.barChartSvg.append('g').attr('transform', `translate(${this.marginX.left}, 0)`);
    this.chartAreaGroup = this.chartAreaSvg.append('g').attr('transform', `translate(${this.marginX.left}, 0)`);

    this.svgWidth = parseFloat(this.chartAreaSvg.style('width'));

    this.innerWidth = this.svgWidth - this.marginX.left - this.marginX.right;

    this.xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);  // x scale is same for all charts
    this.xTimeScale = scaleTime().domain([new Date(0), new Date(this.videoMetadata.duration)]).range([0, this.videoMetadata.numFrames]);

    this.drawPhaseBar();
    this.drawPointer1();
  }

  private drawPhaseBar() {
    this.barChartSvgHeight = this.barChartHeight + this.barChartMarginY.top + this.barChartMarginY.bottom;
    this.barChartSvg.attr('height', this.barChartSvgHeight);

    console.log(this.barChartSvgHeight)

    // get scales
    var yScale = scaleBand().domain(['Phase']).range([this.barChartHeight, 0]);
    var colorScale = scaleOrdinal().domain(range(14))
      .range(["#cd5981", "#743b32", "#d24d32", "#c6893f", "#ccb998", "#ccd14e", "#5e7b3b", "#72d263", "#3f4e48", "#76c9bb", "#9697c9", "#6749c1", "#4d2f61", "#c851c5"])

    var transformedData = this.transformPhaseAnnotation();

    // add bar
    this.barChartGroup.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('x', (d) => { return this.xFramesScale(d.from); })
      .attr('y', this.barChartMarginY.top)
      .attr('width', (d) => { return this.xFramesScale(d.to - d.from); })
      .attr('fill', (d) => { return colorScale(d.phase); })
      .attr('height', yScale.bandwidth())
      .on("mouseover", function (d) {
        select(this)
          .style("opacity", .7);
      })
      .on("mouseout", function (d) {
        select(this).transition().duration(300)
          .style("opacity", 1);
      });
  }

  // TODO: maybe it is possible to do it with d3?
  public transformPhaseAnnotation() {
    var currentPhase = this.phaseAnnotation[0].phase;
    var from = 0;
    var to = 0;
    var result = []
    for (var row of this.phaseAnnotation) {
      if (row.phase !== currentPhase) {
        result.push({ phase: currentPhase, from: from, to: to });
        currentPhase = row.phase;
        from = row.frame;
      } else if (row.frame == this.phaseAnnotation.length - 1) {  // last frame
        to = row.frame;
        result.push({ phase: currentPhase, from: from, to: to });
      } else {
        to = row.frame;
      }
    }
    return result;
  }

  private drawPointer1() {
    var pointer = this.barChartGroup.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.barChartSvgHeight)
      .attr("stroke-width", "3")
      .attr("stroke", "gray");

    this.imageFrame = select(`#image-frame-${this.videoMetadata.name}`)
      .style('position', 'relative')
      .append('div')
      .style('position', 'absolute')
      .style('left', `${this.marginX.left - 48}px`)
      .style('top', `${this.barChartMarginY.top - 54 - 20}px`)
      .style('padding-left', '5px')
      .style('padding-right', '5px')
      .style('padding-top', '5px')
      .style('background-color', 'gray')
      .style('border-radius', '.25rem')

    this.image = this.imageFrame.append('img').attr('src', `/data/Frames/${this.videoMetadata.name}/Frame000000.jpg`);

    this.imageFrameInfo = this.imageFrame.append('div').style('font-size', '10px')
      .style('height', '15px').html('0 | 00:00:00');

    this.imageFrameTip = this.barChartGroup.append('polygon')
      .attr('points', `-10,${this.barChartMarginY.top} 10,${this.barChartMarginY.top} 0,${this.barChartMarginY.top + 20}`)
      .style('fill', 'dimgray');

    // add drag behavior for pointer element
    pointer.call(drag().on('drag', this.dragBehavior));
    this.imageFrameTip.call(drag().on('drag', this.dragBehavior));

    // add click behavior for svg element
    this.barChartSvg.on('click', this.clickBehavior);
  }

  dragBehavior = () => {
    var pointers = selectAll(`.pointer-${this.videoMetadata.name}`);
    var xMouse = mouse(this.barChartGroup.node())[0];  // get x mouse position relative to group element
    var xUpdated = xMouse < 0 ? 0 : xMouse > this.innerWidth ? this.innerWidth : xMouse;  // check if x doesnt exceed group 
    pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
    var frameNr = Math.round(this.xFramesScale.invert(xUpdated));
    this.image.attr('src', this.getImageUrl(frameNr));  // update image
    this.imageFrame.style('left', `${this.marginX.left + xUpdated - 48}px`);
    this.imageFrameTip.attr('points', `${xUpdated - 10},${this.barChartMarginY.top} ${xUpdated + 10},${this.barChartMarginY.top} ${xUpdated},${this.barChartMarginY.top + 20}`)
    var time = this.xTimeScale.invert(frameNr);
    this.imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)}`)
  }

  clickBehavior = () => {
    var pointers = selectAll(`.pointer-${this.videoMetadata.name}`);
    var xPos = parseFloat(pointers.attr('x1'));
    var xMouse = mouse(this.barChartGroup.node())[0];  // get x mouse position relative to group element
    var xUpdated = xMouse < 0 ? xPos : xMouse > this.innerWidth ? xPos : xMouse;  // check if x doesnt exceed group, if so do not change x position
    pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
    var frameNr = Math.round(this.xFramesScale.invert(xUpdated));
    this.image.attr('src', this.getImageUrl(frameNr));  // update image
    console.log(typeof xUpdated)
    this.imageFrame.style('left', `${this.marginX.left + xUpdated - 48}px`)
    this.imageFrameTip.attr('points', `${xUpdated - 10},${this.barChartMarginY.top} ${xUpdated + 10},${this.barChartMarginY.top} ${xUpdated},${this.barChartMarginY.top + 20}`)
    var time = this.xTimeScale.invert(frameNr);
    this.imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)}`)
  }

  private drawInstrumentAnnotationGraph() {

    // get scale functions
    var xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    var yScale = scaleBand().domain(this.labels).range([this.graphHeight, 0])
    var headerScale = scaleOrdinal().domain(this.instrumentAnnotation.columns.slice(1)).range(this.labels)
    var colorScale = scaleOrdinal().domain(this.labels)
      .range(["#ff58ab", "#3c5b16", "#5e38b4", "#ff5a09", "#0191bb", "#ff5556", "#91d4ba", "#cd0071", "#ffb555", "#c3baff", "#784543", "#ffabc0"])

    // create group for the graph and move it 
    var group = this.chartAreaGroup.append('g')
      .attr('transform', `translate(0, ${this.chartAreaMarginY.top + this.graphHeight * 3})`)
      .attr('class', `content-${this.videoMetadata.name}`);

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.graphHeight})`)
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
      .attr('transform', `translate(0, ${this.chartAreaMarginY.top + this.graphHeight * i})`)
      .attr('class', `content-${this.videoMetadata.name}`);
    var xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    var yScale = scaleLinear().domain(range).range([this.barChartHeight, 0])

    // add x-axis
    group.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.barChartHeight})`)
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

  public showContent() {
    // selectAll(`.content-${this.videoMetadata.name}`).style('display', 'block')
    // this.svgElement.attr("height", this.svgHeight);
  }

  public hideContent() {
    // selectAll(`.content-${this.videoMetadata.name}`).style('display', 'none')
    // this.svgElement.attr("height", this.barHeight);
  }

  // private drawPointer() {
  //   var pointer = this.chartAreaGroup.append('line')
  //     .attr('class', `pointer-${this.videoMetadata.name}`)
  //     .attr("x1", 0)
  //     .attr("y1", 0)
  //     .attr("x2", 0)
  //     .attr("y2", this.svgHeight)
  //     .attr("stroke-width", "3")
  //     .attr("stroke", "dimgray");
  // }

  private getImageUrl(frameNr) {
    if (frameNr % 500 > 500 / 2) {  // TODO: read from videoMetadata
      while (frameNr % 500 != 0) { frameNr++; }
    } else {
      while (frameNr % 500 != 0) { frameNr--; }
    }

    var frameNrFormat = frameNr.toString().padStart(6, '0');
    return `/data/Frames/${this.videoMetadata.name}/Frame${frameNrFormat}.jpg`;
  }

}
