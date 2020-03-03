import { Component, Input, NgZone, OnInit } from '@angular/core';
import { drag, range, scaleBand, scaleLinear, scaleOrdinal, scaleTime, select } from 'd3';
import { PositioningService } from '../positioning.service';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  @Input() videoMetadata;
  @Input() phaseAnnotation;

  constructor(private eventService: EventService, private zone: NgZone, private positioning: PositioningService) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var svgElement = select(`#bar-chart-${this.videoMetadata.name}`).attr('height', this.positioning.barChartHeight);  // set height of the svg element
    var svgWidth = parseFloat(svgElement.style('width'));  // get width of the svg element
    var innerWidth = svgWidth - this.positioning.marginLeft - this.positioning.marginRight;  // calculate width of the bar

    // create group for the graph and move it 
    var group = svgElement.append('g').attr('transform', `translate(${this.positioning.marginLeft}, 0)`)

    // get x scales
    var xFrameScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, innerWidth]);  // x scale is same for all charts
    var xTimeScale = scaleTime().domain([new Date(0), new Date(this.videoMetadata.duration)]).range([0, this.videoMetadata.numFrames]);

    // move relative container to the right
    select(`#relative-container-${this.videoMetadata.name}`).style('margin-left', `${this.positioning.marginLeft}px`)

    this.drawPhaseBar(group, xFrameScale);
    this.drawPointer(group, svgElement, innerWidth, xFrameScale, xTimeScale);
  }


  private drawPhaseBar(group, xFrameScale) {
    // get scales
    var yScale = scaleBand().domain(['Phase']).range([this.positioning.barChartInnerHeight, 0]);
    var colorScale = scaleOrdinal().domain(range(14))
      .range(["#cd5981", "#743b32", "#d24d32", "#c6893f", "#ccb998", "#ccd14e", "#5e7b3b", "#72d263", "#3f4e48", "#76c9bb", "#9697c9", "#6749c1", "#4d2f61", "#c851c5"])
      .unknown('lime');

    var transformedData = this.transformPhaseAnnotation();

    var tooltipColor = 'lightgray';

    // add tooltip bubble
    var tooltipBubble = select(`#relative-container-${this.videoMetadata.name}`)
      .append('div')
      .attr('class', `tooltipBubble-${this.videoMetadata.name}`)
      .style('position', 'absolute')
      .style('left', '0px')
      .style('top', `${this.positioning.barChartMarginTop - this.positioning.barChartTooltipBubbleHeight - this.positioning.barChartTooltipArrowHeight}px`)  // todo: write function
      .style('opacity', 0)
      .style('background-color', tooltipColor)
      .style('border-radius', '0.25rem')
      .style('text-align', 'center')
      .style('font-size', `${this.positioning.barChartTooltipBubbleFontSize}px`)
      .style('width', `${this.positioning.barChartTooltipBubbleWidth}px`)

    var tooltipArrow = group.append('polygon')
      .attr('points', `${0 - this.positioning.barChartTooltipArrowHeight / 2},${this.positioning.barChartMarginTop - this.positioning.barChartTooltipArrowHeight} ${this.positioning.barChartTooltipArrowHeight / 2},${this.positioning.barChartMarginTop - this.positioning.barChartTooltipArrowHeight} 0,${this.positioning.barChartMarginTop}`)
      .style('fill', tooltipColor)
      .attr('class', `tip-${this.videoMetadata.name}`)
      .style('opacity', 0);

    // add bar
    group.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('x', (d) => { return xFrameScale(d.from); })
      .attr('y', this.positioning.barChartMarginTop)
      .attr('width', (d) => { return xFrameScale(d.to - d.from); })
      .attr('fill', (d) => { return colorScale(d.phase); })
      .attr('height', yScale.bandwidth())
      .on("mouseover", function (d) {
        select(this).style("opacity", .7);
        var coords = this.getBBox(); // todo: replace with scale
        tooltipBubble.text(`Phase: ${d.phase}`).style('opacity', 1)
          .style('left', `${coords.x + coords.width / 2 - 30}px`)

        var tipCoordinates = tooltipArrow.attr('points')
          .split(' ')
          .map((e) => e.split(','))
          .map((e) => e.map((v) => parseFloat(v)));

        tipCoordinates[0][0] = coords.x + coords.width / 2 - 5;
        tipCoordinates[1][0] = coords.x + coords.width / 2 + 5;
        tipCoordinates[2][0] = coords.x + coords.width / 2;

        tooltipArrow.style('opacity', 1)
          .attr('points', () => {
            return tipCoordinates.map(function (d) {
              return d.join(",");
            }).join(" ")
          })
      })
      .on("mouseout", function (d) {
        select(this).style("opacity", 1);
        tooltipBubble.style('opacity', 0)
        tooltipArrow.style('opacity', 0)
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

  private drawPointer(group, svgElement, innerWidth, xFrameScale, xTimeScale) {
    var pointer = group.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr("x1", 0)
      .attr("y1", this.positioning.barChartMarginTop)
      .attr("x2", 0)
      .attr("y2", this.positioning.barChartHeight)
      .attr("stroke-width", this.positioning.pointerWidth)
      .attr("stroke", "gray");

    var imageFrame = select(`#relative-container-${this.videoMetadata.name}`)
      .append('div')
      .attr('class', `image-frame-${this.videoMetadata.name}`)
      .style('position', 'absolute')
      .style('left', `${0 - (this.videoMetadata.frameWidth / 2 + this.positioning.barChartImageFramePadding)}px`)
      .style('top', `${this.positioning.barChartMarginTop - this.videoMetadata.frameHeight - this.positioning.barChartImageFrameInfoHeight - this.positioning.barChartImageFramePadding}px`)
      .style('padding-left', `${this.positioning.barChartImageFramePadding}px`)
      .style('padding-right', `${this.positioning.barChartImageFramePadding}px`)
      .style('padding-top', `${this.positioning.barChartImageFramePadding}px`)
      .style('background-color', 'gray')
      .style('border-radius', '.25rem')

    var image = imageFrame
      .append('div')  // additional div with fixed size of a frame
      .style('width', `${this.videoMetadata.frameWidth}px`)
      .style('height', `${this.videoMetadata.frameHeight}px`)
      .append('img').attr('src', `/data/Frames/${this.videoMetadata.name}/Frame000000.jpg`)
      .attr('class', `image-${this.videoMetadata.name}`);

    var imageFrameInfo = imageFrame.append('div')
      .style('font-size', `${this.positioning.barChartImageFrameInfoFontSize}px`)
      .style('text-align', 'center')
      .style('height', `${this.positioning.barChartImageFrameInfoHeight}px`)
      .text('0 | 00:00:00')
      .attr('class', `image-frame-info-${this.videoMetadata.name}`);

    var imageFrameTip = group.append('polygon')
      .attr('points', `${0 - this.positioning.barChartImageFrameArrowHeight / 2},${this.positioning.barChartMarginTop} ${this.positioning.barChartImageFrameArrowHeight / 2},${this.positioning.barChartMarginTop} 0,${this.positioning.barChartMarginTop + this.positioning.barChartImageFrameArrowHeight}`)
      .style('fill', 'gray')
      .attr('class', `image-frame-tip-${this.videoMetadata.name}`);

    // add drag behavior for pointer element
    pointer.call(drag().on('drag', () => this.eventService.dragBehavior(this.videoMetadata.name, group, innerWidth, this.videoMetadata.frameWidth, xFrameScale, xTimeScale)));
    imageFrameTip.call(drag().on('drag', () => this.eventService.dragBehavior(this.videoMetadata.name, group, innerWidth, this.videoMetadata.frameWidth, xFrameScale, xTimeScale)));

    // add click behavior for svg element
    svgElement.on('click', () => this.eventService.clickBehavior(this.videoMetadata.name, group, innerWidth, this.videoMetadata.frameWidth, xFrameScale, xTimeScale));
  }

}
