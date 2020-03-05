import { Component, Input, NgZone, OnInit } from '@angular/core';
import { drag, scaleBand, scaleLinear, scaleTime, select } from 'd3';
import { PointerService } from '../services/pointer.service';
import { PositioningService } from '../services/positioning.service';
import { ScaleService } from '../services/scale.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  @Input() videoMetadata;
  @Input() phaseAnnotation;

  constructor(private pointerService: PointerService, private pos: PositioningService, private scales: ScaleService, private zone: NgZone) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var svgElement = select(`#bar-chart-${this.videoMetadata.name}`).attr('height', this.pos.barChartHeight);  // set height of the svg element
    var svgWidth = parseFloat(svgElement.style('width'));  // get width of the svg element
    var innerWidth = svgWidth - this.pos.marginLeft - this.pos.marginRight;  // calculate width of the bar

    // create group for the graph and move it 
    var group = svgElement.append('g').attr('transform', `translate(${this.pos.marginLeft}, 0)`);

    // get x scales
    var xFrameScale = scaleLinear().domain([0, this.videoMetadata.numFrames]).range([0, innerWidth]);
    var xTimeScale = scaleTime().domain([0, this.videoMetadata.numFrames]).range([new Date(0), new Date(this.videoMetadata.duration)]);

    // move relative container to the right
    select(`#relative-container-${this.videoMetadata.name}`).style('margin-left', `${this.pos.marginLeft}px`);

    this.drawPhaseBar(group, xFrameScale);
    this.drawPointer(group, svgElement, innerWidth, xFrameScale, xTimeScale);
  }


  private drawPhaseBar(group, xFrameScale) {
    // get y scale
    var yScale = scaleBand().domain(['Phase']).range([this.pos.barChartInnerHeight, 0]);

    var transformedData = this.transformPhaseAnnotation();

    // add tooltip bubble
    var tooltipBubble = select(`#relative-container-${this.videoMetadata.name}`)
      .append('div')
      .attr('class', `tooltipBubble-${this.videoMetadata.name}`)
      .style('position', 'absolute')
      .style('left', '0px')
      .style('height', `${this.pos.barChartTooltipBubbleHeight}px`)
      .style('top', `${this.pos.barChartMarginTop - this.pos.barChartTooltipBubbleHeight - this.pos.barChartTooltipArrowHeight}px`)
      .style('opacity', 0)
      .style('background-color', 'lightgray')
      .style('border-radius', '0.25rem')
      .style('text-align', 'center')
      .style('font-size', `${this.pos.barChartTooltipBubbleFontSize}px`)
      .style('width', `${this.pos.barChartTooltipBubbleWidth}px`);

    // add tooltip arrow
    var tooltipArrow = group.append('polygon')
      .attr('points', `${0 - this.pos.barChartTooltipArrowHeight / 2},${this.pos.barChartMarginTop - this.pos.barChartTooltipArrowHeight} ${this.pos.barChartTooltipArrowHeight / 2},${this.pos.barChartMarginTop - this.pos.barChartTooltipArrowHeight} 0,${this.pos.barChartMarginTop}`)
      .style('fill', 'lightgray')
      .attr('class', `arrow-${this.videoMetadata.name}`)
      .style('opacity', 0);

    // add bar
    var phases = group.append('g').selectAll('rect')
      .data(transformedData)
      .enter().append('rect')
      .attr('x', (d) => { return xFrameScale(d.from); })
      .attr('y', this.pos.barChartMarginTop)
      .attr('width', (d) => { return xFrameScale(d.to - d.from); })
      .attr('fill', (d) => { return this.scales.phaseAnnotationColorScale(d.phase); })
      .attr('height', yScale.bandwidth());

    var marginTop = this.pos.barChartMarginTop;
    var tooltipBubbleWidth = this.pos.barChartTooltipBubbleWidth;
    var tooltipArrowHeight = this.pos.barChartTooltipArrowHeight;

    // add event listeners outside angular change detection zone
    this.zone.runOutsideAngular(() => {
      phases.on('mouseover', function (d) {
        select(this).style('opacity', .7);
        var position = xFrameScale(d.from) + xFrameScale(d.to - d.from) / 2; // calculate position to place tooltip

        // move tooltip bubble
        tooltipBubble.text(`Phase: ${d.phase}`).style('opacity', 1)
          .style('left', `${position - tooltipBubbleWidth / 2}px`);

        tooltipArrow.style('opacity', 1)
          .attr('points', `${position - tooltipArrowHeight / 2},${marginTop - tooltipArrowHeight} ${position + tooltipArrowHeight / 2},${marginTop - tooltipArrowHeight} ${position},${marginTop}`);
      })
        .on('mouseout', function (d) {
          select(this).style('opacity', 1);
          tooltipBubble.style('opacity', 0)
          tooltipArrow.style('opacity', 0)
        });
    });
  }

  // TODO: unit tests
  public transformPhaseAnnotation() {
    var currentPhase = this.phaseAnnotation[0].phase;
    var from = 0;
    var to = 0;
    var result = [];
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
    // add line
    var pointer = group.append('line')
      .attr('class', `pointer-${this.videoMetadata.name}`)
      .attr('x1', 0)
      .attr('y1', this.pos.barChartMarginTop)
      .attr('x2', 0)
      .attr('y2', this.pos.barChartHeight)
      .attr('stroke-width', this.pos.pointerWidth)
      .attr('stroke', 'gray');

    // add image frame
    var imageFrame = select(`#relative-container-${this.videoMetadata.name}`)
      .append('div')
      .attr('class', `image-frame-${this.videoMetadata.name}`)
      .style('position', 'absolute')
      .style('left', `${0 - (this.videoMetadata.frameWidth / 2 + this.pos.barChartImageFramePadding)}px`)
      .style('top', `${this.pos.barChartMarginTop - this.videoMetadata.frameHeight - this.pos.barChartImageFrameInfoHeight - this.pos.barChartImageFramePadding}px`)
      .style('padding-left', `${this.pos.barChartImageFramePadding}px`)
      .style('padding-right', `${this.pos.barChartImageFramePadding}px`)
      .style('padding-top', `${this.pos.barChartImageFramePadding}px`)
      .style('background-color', 'gray')
      .style('border-radius', '.25rem');

    // add image
    var image = imageFrame
      .append('div')  // additional div with fixed size of a frame
      .style('width', `${this.videoMetadata.frameWidth}px`)
      .style('height', `${this.videoMetadata.frameHeight}px`)
      .append('img').attr('src', `/data/Frames/${this.videoMetadata.name}/Frame000000.jpg`)
      .attr('class', `image-${this.videoMetadata.name}`);

    // add image frame info section
    var imageFrameInfo = imageFrame.append('div')
      .style('font-size', `${this.pos.barChartImageFrameInfoFontSize}rem`)
      .style('text-align', 'center')
      .style('height', `${this.pos.barChartImageFrameInfoHeight}px`)
      .text(`0 | 00:00:00 | ${this.phaseAnnotation[0].phase}`)
      .attr('class', `image-frame-info-${this.videoMetadata.name}`);

    // add image frame arrow
    var imageFrameArrow = group.append('polygon')
      .attr('points', `${0 - this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} 0,${this.pos.barChartMarginTop + this.pos.barChartImageFrameArrowHeight}`)
      .style('fill', 'gray')
      .attr('class', `image-frame-arrow-${this.videoMetadata.name}`);

    // add event listeners outside angular change detection zone
    this.zone.runOutsideAngular(() => {
      // add drag behavior for pointer element
      pointer.call(drag().on('drag', () => this.pointerService.movePointer(this.videoMetadata.name, group, innerWidth, this.videoMetadata.frameSamplingRate, this.videoMetadata.numFrames, this.videoMetadata.frameWidth, this.phaseAnnotation, xFrameScale, xTimeScale)));
      imageFrameArrow.call(drag().on('drag', () => this.pointerService.movePointer(this.videoMetadata.name, group, innerWidth, this.videoMetadata.frameSamplingRate, this.videoMetadata.numFrames, this.videoMetadata.frameWidth, this.phaseAnnotation, xFrameScale, xTimeScale)));

      // add click behavior for svg element
      svgElement.on('click', () => this.pointerService.movePointer(this.videoMetadata.name, group, innerWidth, this.videoMetadata.frameSamplingRate, this.videoMetadata.numFrames, this.videoMetadata.frameWidth, this.phaseAnnotation, xFrameScale, xTimeScale));
    });
  }

}
