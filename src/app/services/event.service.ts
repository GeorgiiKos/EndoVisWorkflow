import { Injectable } from '@angular/core';
import { mouse, selectAll } from 'd3';
import { PositioningService } from './positioning.service';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private pos: PositioningService) { }

  public dragBehavior(name, group, width, frameSamplingRate, frameWidth, xFramesScale, xTimeScale) {
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
    imageFrame.style('left', `${xUpdated - (frameWidth / 2 + this.pos.barChartImageFramePadding)}px`)
    imageFrameArrow.attr('points', `${xUpdated - this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${xUpdated + this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${xUpdated},${this.pos.barChartMarginTop + this.pos.barChartImageFrameArrowHeight}`)
    var time = xTimeScale(frameNr);
    imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)}`)
  }

  public clickBehavior(name, group, width, frameSamplingRate, frameWidth, xFramesScale, xTimeScale) {
    var pointers = selectAll(`.pointer-${name}`);
    var image = selectAll(`.image-${name}`);
    var imageFrame = selectAll(`.image-frame-${name}`);
    var imageFrameArrow = selectAll(`.image-frame-arrow-${name}`);
    var imageFrameInfo = selectAll(`.image-frame-info-${name}`);

    var xPos = parseFloat(pointers.attr('x1'));
    var xMouse = mouse(group.node())[0];  // get x mouse position relative to group element
    var xUpdated = xMouse < 0 ? xPos : xMouse > width ? xPos : xMouse;  // check if x doesnt exceed group, if so do not change x position
    pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
    var frameNr = Math.round(xFramesScale.invert(xUpdated));  // calculate frame number
    image.attr('src', this.getImageUrl(name, frameNr, frameSamplingRate));  // update image
    imageFrame.style('left', `${xUpdated - (frameWidth / 2 + this.pos.barChartImageFramePadding)}px`)
    imageFrameArrow.attr('points', `${xUpdated - this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${xUpdated + this.pos.barChartImageFrameArrowHeight / 2},${this.pos.barChartMarginTop} ${xUpdated},${this.pos.barChartMarginTop + this.pos.barChartImageFrameArrowHeight}`)
    var time = xTimeScale(frameNr);
    imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)}`)
  }

  private getImageUrl(name, frameNr, frameSamplingRate) {
    while (frameNr % frameSamplingRate != 0) { frameNr--; }

    var frameNrFormat = frameNr.toString().padStart(6, '0');
    return `/data/Frames/${name}/Frame${frameNrFormat}.jpg`;
  }
}
