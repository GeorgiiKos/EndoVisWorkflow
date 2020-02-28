import { Injectable } from '@angular/core';
import { mouse, selectAll } from 'd3';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor() { }

  public dragBehavior(name, group, width, marginLeft, marginTop, xFramesScale, xTimeScale) {
    var pointers = selectAll(`.pointer-${name}`);
    var image = selectAll(`.image-${name}`);
    var imageFrame = selectAll(`.image-frame1-${name}`);
    var imageFrameTip = selectAll(`.image-frame-tip-${name}`);
    var imageFrameInfo = selectAll(`.image-frame-info-${name}`);

    var xMouse = mouse(group.node())[0];  // get x mouse position relative to group element
    var xUpdated = xMouse < 0 ? 0 : xMouse > width ? width : xMouse;  // check if x doesnt exceed group 
    pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
    var frameNr = Math.round(xFramesScale.invert(xUpdated));
    image.attr('src', this.getImageUrl(name, frameNr));  // update image
    imageFrame.style('left', `${marginLeft + xUpdated - 48}px`);
    imageFrameTip.attr('points', `${xUpdated - 10},${marginTop} ${xUpdated + 10},${marginTop} ${xUpdated},${marginTop + 20}`)
    var time = xTimeScale.invert(frameNr);
    imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)}`)
  }

  public clickBehavior(name, group, width, marginLeft, marginTop, xFramesScale, xTimeScale) {
    var pointers = selectAll(`.pointer-${name}`);
    var image = selectAll(`.image-${name}`);
    var imageFrame = selectAll(`.image-frame1-${name}`);
    var imageFrameTip = selectAll(`.image-frame-tip-${name}`);
    var imageFrameInfo = selectAll(`.image-frame-info-${name}`);

    var xPos = parseFloat(pointers.attr('x1'));
    var xMouse = mouse(group.node())[0];  // get x mouse position relative to group element
    var xUpdated = xMouse < 0 ? xPos : xMouse > width ? xPos : xMouse;  // check if x doesnt exceed group, if so do not change x position
    pointers.attr('x1', xUpdated).attr('x2', xUpdated);  // update pointer position
    var frameNr = Math.round(xFramesScale.invert(xUpdated));
    image.attr('src', this.getImageUrl(name, frameNr));  // update image
    imageFrame.style('left', `${marginLeft + xUpdated - 48}px`)
    imageFrameTip.attr('points', `${xUpdated - 10},${marginTop} ${xUpdated + 10},${marginTop} ${xUpdated},${marginTop + 20}`)
    var time = xTimeScale.invert(frameNr);
    imageFrameInfo.text(`${frameNr} | ${('0' + time.getUTCHours()).slice(-2)}:${('0' + time.getUTCMinutes()).slice(-2)}:${('0' + time.getUTCSeconds()).slice(-2)}`)
  }


  private getImageUrl(name, frameNr) {  // TODO: read from videoMetadata
    while (frameNr % 500 != 0) { frameNr--; }

    var frameNrFormat = frameNr.toString().padStart(6, '0');
    return `/data/Frames/${name}/Frame${frameNrFormat}.jpg`;
  }
}
