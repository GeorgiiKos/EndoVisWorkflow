import { Component, Input, OnInit } from '@angular/core';
import { drag, event, mouse, range, scaleBand, scaleLinear, scaleOrdinal, select, selectAll } from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  @Input() videoMetadata;
  @Input() phaseAnnotation;

  private svgElement;

  // positioning variables
  private margin = { top: 50, bottom: 10, left: 87.88, right: 87.88 };
  private svgWidth;
  private svgHeight = 100;
  private innerWidth;
  private innerHeight;

  private group;

  private xScale;
  private yScale;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.svgElement = select('#bar-chart-' + this.videoMetadata.name).attr('height', this.svgHeight);
    this.svgWidth = parseFloat(this.svgElement.style('width'));

    this.innerWidth = this.svgWidth - this.margin.left - this.margin.right;
    this.innerHeight = this.svgHeight - this.margin.top - this.margin.bottom;

    // create group for the graph and move it 
    this.group = this.svgElement.append('g').attr('transform', `translate(${this.margin.left}, 0)`).attr('width', this.innerWidth);

    this.drawPhaseBar();
    this.drawPointer();
  }

  private drawPhaseBar() {
    // get scales
    this.xScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);
    this.yScale = scaleBand().domain(['Phase']).range([this.innerHeight, 0]);
    var colorScale = scaleOrdinal().domain(range(14))
      .range(["#cd5981", "#743b32", "#d24d32", "#c6893f", "#ccb998", "#ccd14e", "#5e7b3b", "#72d263", "#3f4e48", "#76c9bb", "#9697c9", "#6749c1", "#4d2f61", "#c851c5"])

    var transformedData = this.transformPhaseAnnotation();

    // Define the div for the tooltip
    var div = this.group.append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // add bar
    this.group.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('x', (d) => { return this.xScale(d.from); })
      .attr('y', 70)
      .attr('width', (d) => { return this.xScale(d.to - d.from); })
      .attr('fill', (d) => { return colorScale(d.phase); })
      .attr('height', this.yScale.bandwidth())
      .on("mouseover", function (d) {
        select(this)
          .style("opacity", .7);
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d.phase)
          .style("left", event.pageX)
          .style("top", event.pageY);
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

  private drawPointer() {
    var pointer = this.group.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.svgHeight)
      .attr("stroke-width", "3")
      .attr("stroke", "dimgray");

    var imgFrame = select(`#image-frame-${this.videoMetadata.name}`)
      .style('position', 'relative')
      .append('div')
      .style('position', 'absolute')
      .style('left', `${this.margin.left}px`)

    var img = imgFrame.append('img').attr('src', `/data/Frames/${this.videoMetadata.name}/Frame000000.jpg`);

    // add drag behavior for pointer element
    pointer.call(drag().on('drag', () => {
      var pointers = selectAll(`.pointer-${this.videoMetadata.name}`);
      var xMouse = mouse(this.group.node())[0];  // get x mouse position relative to group element
      var xUpdated = xMouse < 0 ? 0 : xMouse > this.innerWidth ? this.innerWidth : xMouse;  // check if x doesnt exceed group 
      pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
      img.attr('src', this.getImageUrl(xUpdated));  // update image
      imgFrame.style('left', `${this.margin.left + xUpdated}px`)
    }));

    // add click behavior for svg element
    this.svgElement.on('click', () => {
      var xPos = pointer.attr('x1');
      var pointers = selectAll(`.pointer-${this.videoMetadata.name}`);
      var xMouse = mouse(this.group.node())[0];  // get x mouse position relative to group element
      var xUpdated = xMouse < 0 ? xPos : xMouse > this.innerWidth ? xPos : xMouse;  // check if x doesnt exceed group, if so do not change x position
      pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
      img.attr('src', this.getImageUrl(xUpdated));  // update image
      imgFrame.style('left', `${this.margin.left + xUpdated}px`)
    });
  }

  private getImageUrl(xPos) {
    var frameNr = Math.round(this.xScale.invert(xPos));
    while (frameNr % 500 != 0) {
      frameNr--;
    }
    var frameNrFormat = frameNr.toString().padStart(6, '0');
    return `/data/Frames/${this.videoMetadata.name}/Frame${frameNrFormat}.jpg`;
  }
}
