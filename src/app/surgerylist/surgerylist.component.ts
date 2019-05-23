import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PhasePercentage } from '../models/phasePercentage';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';
import { SurgeryScale } from '../models/surgeryScale';
import { DataService } from '../services/data.service';
import { Scale } from '../models/scale';

@Component({
  selector: 'app-surgerylist',
  templateUrl: './surgerylist.component.html',
  styleUrls: ['./surgerylist.component.css']
})
export class SurgerylistComponent implements OnInit {

  surgeryList: Surgery[] = [];
  surgeryPhases: SurgeryPhases[] = []
  surgeryScale: SurgeryScale[] = []
  scaleFunctions: Scale[] = []

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadSurgeryList();
  }

  public loadSurgeryList() {
    this.dataService.getSurgeryList()
      .subscribe(response => {
        this.surgeryList = response;
        for (let i in this.surgeryList) {
          this.surgeryList[i].loading = true
          this.loadSurgeryPhases(this.surgeryList[i].name)
        }
      })
  }

  public loadSurgeryPhases(surgerName: String) {
    this.dataService.getPhasesArray(surgerName)
      .subscribe(response => {
        this.surgeryPhases.push(response); // TODO: check doubles
        this.calcPercentage(surgerName);
      })
  }

  public calcPercentage(surgeryName: String) {
    var index = this.surgeryPhases.findIndex(d => d.name == surgeryName);
    var phases = this.surgeryPhases[index].phases;
    var result = new Array();

    var currVal = -1;
    var currIndex = -1;
    for (var i in phases) {
      if (phases[i][1] != currVal) { // value changed
        currIndex++;
        currVal = phases[i][1];
        result.push([phases[i][1]])
        result[currIndex].push(1)
      } else {
        result[currIndex][1] = result[currIndex][1] + 1;
      }
    }

    console.log("THE RESULT FOR", surgeryName, result)

    //var res = d3.nest().key((d) => { return d[1] }).rollup((v) => { return v.length }).entries(this.surgeryPhases[index].phases);

    var sum = 0
    result.map(d => sum += d[1])
    var scaleFunc = d3.scaleLinear().domain([0, sum]).range([0, 100]);

    this.scaleFunctions.push(new Scale(surgeryName, scaleFunc));

    var phasesScaled = []
    result.map(d => phasesScaled.push(new PhasePercentage(d[0], scaleFunc(d[1]))))

    this.surgeryScale.push(new SurgeryScale(surgeryName, phasesScaled))

    this.drawBars(surgeryName);
  }

  public drawBars(surgeryName: String) {
    var svg = d3.select('#' + surgeryName)
    var prevPos = 0
    this.surgeryScale.find(d => d.name == surgeryName).percentage.map(d => {
      svg.append('rect').attr("x", prevPos + "%").attr("y", 20).attr("width", d.percent + "%").attr("height", 40).attr("fill", () => {
        switch (Number(d.phaseNr)) {
          case 0:
            return "red"
          case 1:
            return "green"
          case 2:
            return "blue"
          case 3:
            return "Olive"
          case 4:
            return "yellow"
          case 5:
            return "grey"
          case 6:
            return "black"
          case 7:
            return "orange"
          case 8:
            return "purple"
          case 9:
            return "brown"
          case 10:
            return "cyan"
          case 11:
            return "aqua"
          case 12:
            return "fuchsia"
        }
      });
      prevPos = prevPos + d.percent.valueOf();
      this.surgeryList.find(d => d.name == surgeryName).loading = false;
    })

    var line = svg.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 80).attr("stroke-width", 4).attr("stroke", "gray");
    var image = svg.append("image").attr("xlink:href", "http://localhost:8000/api/getImage?frame=0").attr("x", 0).attr("y", 0);
    //var imageFrame = image.append("rect").attr("y", 0).attr("x", 0).attr("fill", "gray").attr("width", "100px").attr("height", "100px");

    var updateImage = (frameNr) => {
      image.attr("xlink:href", "http://localhost:8000/api/getImage?frame=" + frameNr)
    }

    var drag = (d) => {
      var svgWidth = parseFloat(svg.style("width"));
      var lineX = parseFloat(line.attr("x1"))

      console.log(lineX)

      line.attr("x1", lineX < 0 ? 0 : lineX > svgWidth ? svgWidth : d3.event.x).attr("x2", lineX < 0 ? 0 : lineX > svgWidth ? svgWidth : d3.event.x);
      image.attr("x", lineX < 0 ? 0 : lineX > svgWidth ? svgWidth : d3.event.x);

      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(parseFloat(d3.event.x) / parseFloat(svg.style("width")) * 100)));
      updateImage(frameNr);
    }

    svg.on("click", () => {
      var coords = d3.mouse(svg.node());
      line.raise().attr("x1", coords[0]).attr("x2", coords[0]);
      image.attr("x", coords[0])

      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(parseFloat(coords[0]) / parseFloat(svg.style("width")) * 100));
      updateImage(frameNr);
    });

    line.call(d3.drag().on("drag", drag))
    //line.call(d3.drag().on("start", {}))
    //line.call(d3.drag().on("end", {}))
    image.call(d3.drag().on("drag", drag))
  }


}