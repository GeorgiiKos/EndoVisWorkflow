import { Component, Input, OnInit } from '@angular/core';
import { axisBottom, axisLeft, scaleBand, scaleLinear, scaleOrdinal, select } from 'd3';


@Component({
  selector: 'app-chart-area',
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.css']
})
export class ChartAreaComponent implements OnInit {

  @Input() videoMetadata;
  @Input() phaseAnnotation;
  @Input() deviceData;
  @Input() instrumentAnnotation;

  private labels = ["Grasper", "Harmonic Scalpel", "J-hook", "Ligasure", "Scissors", "Stapler", "Aspirator",
    "Swapholder", "Silicone Drain", "Clipper", "I-Hook", "Needle Holder"];

  // positioning variables
  private height = 200;
  private marginX = 90;
  private marginY = 20;


  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.drawInstrumentAnnotationGraph();
  }

  private drawInstrumentAnnotationGraph() {
    var svg = select('#timeline-chart-' + this.videoMetadata.name).attr('height', this.height)
    var svgWidth = parseFloat(svg.style("width"));

    var innerWidth = svgWidth - this.marginX * 2;
    var innerHeight = this.height - this.marginY * 2;

    // get scale functions
    var xScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, innerWidth]);
    var yScale = scaleBand().domain(this.labels).range([innerHeight, 0])
    var headerScale = scaleOrdinal().domain(this.instrumentAnnotation.columns.slice(1)).range(this.labels)
    var colorScale = scaleOrdinal().domain(this.labels)
      .range(["gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"])

    // create group for the graph and move it 
    var group = svg.append('g').attr("transform", `translate(${this.marginX}, ${this.marginY})`);

    // add x-axis
    group.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${this.height - this.marginY * 2})`)
      .call(axisBottom(xScale));

    // add y-axis
    group.append("g")
      .attr("class", "y-axis")
      .call(axisLeft(yScale));

    // transform data into a better representation
    var transformedData = this.transformInstrumentAnnotation(this.instrumentAnnotation)

    // add bars
    group.append("g").selectAll("rect")
      .data(transformedData)
      .enter().append("rect")
      .attr("x", function (d) { return xScale(d.from); })
      .attr("y", function (d) { return yScale(headerScale(d.header)); })
      .attr("width", function (d) { return xScale(d.to - d.from); })
      .attr("fill", function (d) { return colorScale(headerScale(d.header)); })
      .attr("height", yScale.bandwidth());

    // group.append("g")
    //   .attr("class", "grid")
    //   .call(axisLeft(yScale).ticks(13)
    //     .tickSize(-svgWidth)
    //     .tickFormat("")
    //   )
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
          result.push({ "header": header, "from": from, "to": to })
        }
      }
    }
    return result
  }
}
