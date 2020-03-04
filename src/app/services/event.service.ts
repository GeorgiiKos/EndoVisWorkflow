import { Injectable } from '@angular/core';
import { mouse, select, selectAll } from 'd3';
import { PositioningService } from './positioning.service';
import { ScaleService } from './scale.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private pos: PositioningService, private scales: ScaleService) { }

  public movePointer(name, group, width, frameSamplingRate, frameWidth, phaseAnnotation, xFramesScale, xTimeScale) {
    var pointers = selectAll(`.pointer-${name}`);
    var image = selectAll(`.image-${name}`);
    var imageFrame = selectAll(`.image-frame-${name}`);
    var imageFrameArrow = selectAll(`.image-frame-arrow-${name}`);
    var imageFrameInfo = selectAll(`.image-frame-info-${name}`);

    var xMouse = mouse(group.node())[0];  // get x mouse position relative to group element
    var xUpdated = xMouse < 0 ? 0 : xMouse > width ? width : xMouse;  // check if x doesnt exceed group 
    pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
    var frameNr = Math.round(xFramesScale.invert(xUpdated));  // calculate frame number
    image.attr('src', this.getImageUrl(name, frameNr, frameSamplingRate));  // update image
    imageFrame.style('left', `${xUpdated - (frameWidth / 2 + this.pos.barChartImageFramePadding)}px`);
    imageFrameArrow.attr('points', `${xUpdated - this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${xUpdated + this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${xUpdated},${this.pos.barChartMarginTop + this.pos.barChartImageFrameArrowHeight}`);
    var time = xTimeScale(frameNr);  // calculate time
    var phase = phaseAnnotation[frameNr] ? phaseAnnotation[frameNr].phase : 'x';  // calculate phase
    imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)} | ${phase}`);

    this.highlightInsturments(name, frameNr);
  }

  public highlightInsturments(name, frameNr) {
    var chartArea = select(`#chart-area-${name}`); // select chart area
    var rects = selectAll(`.instrument-${name}`);  // select rects
    var rectsIntersect = rects.filter((d) => d.from <= frameNr && d.to >= frameNr);  // select rects that intersect with pointer

    var labels = chartArea.select('.y-axis-instrumentAnnotation').selectAll('text');  // select and resert labels

    // extract instrument names from class names
    var rectsIntersect = rects.filter((d) => d.from <= frameNr && d.to >= frameNr);
    var columns = [];
    rectsIntersect.each(function (d) { columns.push(select(this).attr('class').split(' ')[1]) });
    columns = columns.map((e) => this.scales.instrumentAnnotationHeaderScale(e));

    labels.filter((d) => !columns.includes(d)).style('font-weight', 'normal').style('fill', 'black');  // reset labels for rects that do not intersect with pointer
    labels.filter((d) => columns.includes(d)).style('font-weight', 'bold').style('fill', 'red');  // add effect for labels for rects that intersect with pointer

    rects.filter((d) => d.from > frameNr || d.to < frameNr).attr('opacity', 1);  // reset rects that do not intersect with pointer
    rectsIntersect.attr('opacity', 0.7);  // add effect for rects that intersect with pointer
  }

  private getImageUrl(name, frameNr, frameSamplingRate) {
    while (frameNr % frameSamplingRate != 0) { frameNr--; }

    var frameNrFormat = frameNr.toString().padStart(6, '0');
    return `/data/Frames/${name}/Frame${frameNrFormat}.jpg`;
  }
}
