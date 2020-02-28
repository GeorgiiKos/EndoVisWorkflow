import { Component, Input, OnInit } from '@angular/core';
import { drag, range, scaleBand, scaleLinear, scaleOrdinal, scaleTime, select } from 'd3';
import { EventService } from '../services/event.service';

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
  private margin = { top: 70, bottom: 5, left: 87.88, right: 87.88 };
  private svgWidth;
  private svgHeight = 100;
  private innerWidth;
  private innerHeight = 35;

  private group;

  private xFramesScale;
  private xTimeScale;

  constructor(private eventService: EventService) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.svgElement = select('#bar-chart-' + this.videoMetadata.name).attr('height', this.svgHeight);
    this.svgWidth = parseFloat(this.svgElement.style('width'));
    this.innerWidth = this.svgWidth - this.margin.left - this.margin.right;
    this.svgHeight = this.innerHeight + this.margin.top + this.margin.bottom;
    this.svgElement.attr('height', this.svgHeight);

    // create group for the graph and move it 
    this.group = this.svgElement.append('g').attr('transform', `translate(${this.margin.left}, 0)`).attr('width', this.innerWidth);

    this.xFramesScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, this.innerWidth]);  // x scale is same for all charts
    this.xTimeScale = scaleTime().domain([new Date(0), new Date(this.videoMetadata.duration)]).range([0, this.videoMetadata.numFrames]);

    this.drawPhaseBar()
    this.drawPointer()
  }


  private drawPhaseBar() {
    // get scales
    var yScale = scaleBand().domain(['Phase']).range([this.innerHeight, 0]);
    var colorScale = scaleOrdinal().domain(range(14))
      .range(["#cd5981", "#743b32", "#d24d32", "#c6893f", "#ccb998", "#ccd14e", "#5e7b3b", "#72d263", "#3f4e48", "#76c9bb", "#9697c9", "#6749c1", "#4d2f61", "#c851c5"])

    var transformedData = this.transformPhaseAnnotation();

    // add bar
    this.group.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('x', (d) => { return this.xFramesScale(d.from); })
      .attr('y', this.margin.top)
      .attr('width', (d) => { return this.xFramesScale(d.to - d.from); })
      .attr('fill', (d) => { return colorScale(d.phase); })
      .attr('height', yScale.bandwidth())
      .on("mouseover", function (d) {
        select(this).style("opacity", .7);
      })
      .on("mouseout", function (d) {
        select(this).style("opacity", 1);
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
      .attr("stroke", "gray");

    var imageFrame = select(`#image-frame-${this.videoMetadata.name}`)
      .style('position', 'relative')
      .append('div')
      .attr('class', `image-frame1-${this.videoMetadata.name}`)
      .style('position', 'absolute')
      .style('left', `${this.margin.left - 48}px`)
      .style('top', `${this.margin.top - 54 - 20}px`)
      .style('padding-left', '5px')
      .style('padding-right', '5px')
      .style('padding-top', '5px')
      .style('background-color', 'gray')
      .style('border-radius', '.25rem')

    var image = imageFrame
      .append('div')  // additional div with fixed size of a frame
      .style('width', '96px')
      .style('height', '54px')
      .append('img').attr('src', `/data/Frames/${this.videoMetadata.name}/Frame000000.jpg`)
      .attr('class', `image-${this.videoMetadata.name}`);

    var imageFrameInfo = imageFrame.append('div').style('font-size', '10px')
      .style('height', '15px').html('0 | 00:00:00')
      .attr('class', `image-frame-info-${this.videoMetadata.name}`);


    var imageFrameTip = this.group.append('polygon')
      .attr('points', `-10,${this.margin.top} 10,${this.margin.top} 0,${this.margin.top + 20}`)
      .style('fill', 'gray')
      .attr('class', `image-frame-tip-${this.videoMetadata.name}`);

    // add drag behavior for pointer element
    pointer.call(drag().on('drag', () => this.eventService.dragBehavior(this.videoMetadata.name, this.group, this.innerWidth, this.margin.left, this.margin.top, this.xFramesScale, this.xTimeScale)));
    imageFrameTip.call(drag().on('drag', () => this.eventService.dragBehavior(this.videoMetadata.name, this.group, this.innerWidth, this.margin.left, this.margin.top, this.xFramesScale, this.xTimeScale)));

    // add click behavior for svg element
    this.svgElement.on('click', () => this.eventService.clickBehavior(this.videoMetadata.name, this.group, this.innerWidth, this.margin.left, this.margin.top, this.xFramesScale, this.xTimeScale));
  }

}
