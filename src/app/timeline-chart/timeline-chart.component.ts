import { Component, Input, OnInit } from '@angular/core';
import { axisBottom, axisLeft, csvParse, scaleBand, scaleLinear, select, scaleOrdinal } from 'd3';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.css']
})
export class TimelineChartComponent implements OnInit {

  // surgery object passed from parent component
  @Input() surgery;

  private instrumentAnnotation;
  private labels = ["Grasper", "Harmonic Scalpel", "J-hook", "Ligasure", "Scissors", "Stapler", "Aspirator",
    "Swapholder", "Silicone Drain", "Clipper", "I-Hook", "Needle Holder"];

  // positioning variables
  private height = 200;
  private marginX = 90;
  private marginY = 20;
  private barHeight = 10;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getInstrumentAnnotation(this.surgery.name).subscribe(response => {
      this.instrumentAnnotation = csvParse(response, function (row) {
        for (var key of Object.keys(row)) {
          row[key] = parseInt(row[key])
        }
        return row
      });
      this.drawGraph();
    })
  }

  private drawGraph() {
    var svg = select('#timeline-chart-' + this.surgery.name).attr('height', this.height)
    var svgWidth = parseFloat(svg.style("width"));

    // get scale functions
    var scaleX = scaleLinear().domain([0, this.surgery.numFrames]).range([0, svgWidth - this.marginX * 2]);
    var scaleY = scaleBand().domain(this.labels).range([this.height - this.marginY * 2, 0])
    var scaleHeader = scaleOrdinal().domain(this.instrumentAnnotation.columns.slice(1)).range(this.labels)
    var scaleColor = scaleOrdinal().domain(this.labels)
      .range(["gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"])

    // create group for the graph and move it 
    var group = svg.append('g').attr("transform", `translate(${this.marginX}, ${this.marginY})`);

    // add x-axis
    group.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${this.height - this.marginY * 2})`)
      .call(axisBottom(scaleX));

    // add y-axis
    group.append("g")
      .attr("class", "y-axis")
      .call(axisLeft(scaleY));

    // transform data into a better representation
    var transformedData = this.transformData(this.instrumentAnnotation)

    // add bars
    group.append("g").selectAll("rect")  // what?
      .data(transformedData)
      .enter().append("rect")
      .attr("x", function (d) { return scaleX(d.from); })
      .attr("y", function (d) { return scaleY(scaleHeader(d.header)); })
      .attr("width", function (d) { return scaleX(d.to - d.from); })
      .attr("fill", function (d) { return scaleColor(scaleHeader(d.header)); })
      .attr("height", this.barHeight);

    group.append("g")
      .attr("class", "grid")
      .call(axisLeft(scaleY).ticks(13)
        .tickSize(-svgWidth)
        .tickFormat("")
      )
  }

  // TODO: maybe it is possible to do it with d3?
  private transformData(data) {
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
