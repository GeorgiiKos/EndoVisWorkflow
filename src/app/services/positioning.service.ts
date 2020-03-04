import { Injectable } from '@angular/core';
import { sum } from 'd3';

@Injectable({
  providedIn: 'root'
})
export class PositioningService {

  constructor() { }

  // global variables
  marginLeft = 95;
  marginRight = 95;
  pointerWidth = 2;

  // bar chart
  barChartInnerHeight = 35;
  barChartMarginTop = 75;
  barChartMarginBottom = 0;

  barChartTooltipBubbleWidth = 60;
  barChartTooltipBubbleHeight = 18;
  barChartTooltipBubbleFontSize = 12;
  barChartTooltipArrowHeight = 10;

  barChartImageFramePadding = 5;
  barChartImageFrameInfoHeight = 15;
  barChartImageFrameInfoFontSize = 10;
  barChartImageFrameArrowHeight = 16;

  // chart area
  chartAreaMarginTop = [5, 0, 0, 0];
  chartAreaMarginBottom = [20, 20, 20, 20];
  chartAreaInnerHeight = [100, 100, 50, 120];
  chartAreaTicks = [9, 8, 2];  // instrumentAnnotation graph has a fixed number of ticks

  get barChartHeight() {
    return this.barChartMarginTop + this.barChartInnerHeight + this.barChartMarginBottom;
  }

  get chartAreaHeight() {
    return sum(this.chartAreaInnerHeight) + sum(this.chartAreaMarginTop) + sum(this.chartAreaMarginBottom);
  }

  // this method calculates position for each graph in the chart area
  public calcChartAreaYPos(index) {
    var sum = 0;
    for (var i = 0; i < index; i++) {
      sum += this.chartAreaInnerHeight[i] + this.chartAreaMarginBottom[i];
    }
    for (var i = 0; i < index + 1; i++) {
      sum += this.chartAreaMarginTop[i];
    }
    return sum;
  }

  // this method converts polygon points to array
  public convertPointsToArray(points) {
    return points.split(' ')
      .map((e) => e.split(','))
      .map((e) => e.map((v) => parseFloat(v)));
  }

  // this method converts array to polygon points
  public convertArrayToPoints(array) {
    return array.map(function (d) {
      return d.join(",");
    }).join(" ")
  }

}
