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
  private barMargin = { top: 50, bottom: 10, left: 87.88, right: 87.88 };
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
    // this.svgElement = select('#bar-chart-' + this.videoMetadata.name).attr('height', this.svgHeight);
    // this.svgWidth = parseFloat(this.svgElement.style('width'));

    // this.innerWidth = this.svgWidth - this.barMargin.left - this.barMargin.right;
    // this.innerHeight = this.svgHeight - this.barMargin.top - this.barMargin.bottom;

    // // create group for the graph and move it 
    // this.group = this.svgElement.append('g').attr('transform', `translate(${this.barMargin.left}, 0)`).attr('width', this.innerWidth);
  }

  
}
