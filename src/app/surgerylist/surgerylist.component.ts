import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PhasePercentage } from '../models/phasePercentage';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';
import { SurgeryScale } from '../models/surgeryScale';
import { DataService } from '../services/data.service';
import { Scale } from '../models/scale';
import { DeviceData } from '../models/DeviceData';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-surgerylist',
  templateUrl: './surgerylist.component.html',
  styleUrls: ['./surgerylist.component.css'],
})
export class SurgerylistComponent implements OnInit {

  surgeryList: Surgery[] = [];

  surgeryPhases: SurgeryPhases[] = []
  surgeryScale: SurgeryScale[] = []
  scaleFunctions: Scale[] = []

  deviceData: DeviceData[] = []

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
        this.calcPhasePercentage(surgerName);
      })
  }

  public calcPhasePercentage(surgeryName: String) {
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

    var sum = 0
    result.map(d => sum += d[1])
    console.log("SUM: " + sum)
    var scaleFunc = d3.scaleLinear().domain([0, sum]).range([0, 100]);

    this.scaleFunctions.push(new Scale(surgeryName, scaleFunc));

    var phasesScaled = []
    result.map(d => phasesScaled.push(new PhasePercentage(d[0], scaleFunc(d[1]))))

    this.surgeryScale.push(new SurgeryScale(surgeryName, phasesScaled))

    this.drawBars(surgeryName);
  }

  public calcDevicePercentage(surgeryName: String) {
    var index = this.deviceData.findIndex(d => d.name == surgeryName);

    var scaleFuncX = d3.scaleLinear().domain([0,]).range([0, 100]);
    var scaleFuncY = d3.scaleLinear().domain([0,]).range([0, 100]);
  }

  public drawBars(surgeryName: String) {
    // Define the div for the tooltip
    var div = d3.select("#card-" + surgeryName).append("div")
      .attr("class", "ttip")
      .style("opacity", 0);
    var tip = d3.select("#card-" + surgeryName).append("div")
      .attr("class", "tip")
      .style("opacity", 0);

    var svg = d3.select('#' + surgeryName)  // find the right svg
    var prevPos = 0
    this.surgeryScale.find(d => d.name == surgeryName).percentage.map(d => {
      svg.append('rect').attr("x", prevPos + "%").attr("y", 20).attr("width", d.percent + "%").attr("height", 40)
        .on("mouseover", function () {
          var thisRect = d3.select(this);
          var rectCoords = this.getBBox();

          thisRect.transition()
            .duration(300)
            .style("opacity", .7);
          div.transition()
            .duration(300)
            .style("opacity", 1);
          tip.transition()
          .duration(300)
          .style("opacity", .9);
          div.html("Phase: " + d.phaseNr)
            .style("left", (rectCoords.x + (rectCoords.width / 2) - 10) + "px") // minus padding
            .style("top", "61px"); // 20 + 24 + 12 - 6 + 20.6 + 8 + 20 - 10 - 27.6
          tip.style("left", (rectCoords.x + (rectCoords.width / 2) - 10 + 25) + "px")
            .style("top", "88.6px"); // 20 + 24 + 12 - 6 + 20.6 + 8 + 20 - 10
        })
        .on("mouseout", function () {
          var thisRect = d3.select(this);
          div.transition()
            .duration(300)
            .style("opacity", 0);
          tip.transition()
            .duration(300)
            .style("opacity", 0);
          thisRect.transition()
            .duration(300)
            .style("opacity", 1);
        })
        .attr("fill", () => {
          switch (Number(d.phaseNr)) {
            case 0:
              return "#fe2712"
            case 1:
              return "#fe2712"
            case 2:
              return "#a7194b"
            case 3:
              return "#8601af"
            case 4:
              return "#3d01a4"
            case 5:
              return "#0247fe"
            case 6:
              return "#0392ce"
            case 7:
              return "#66b032"
            case 8:
              return "#d0ea2b"
            case 9:
              return "#fefe33"
            case 10:
              return "#fabc02"
            case 11:
              return "#fb9902"
            case 12:
              return "#8e8e8e"
          }
        })
      prevPos = prevPos + d.percent.valueOf();
      this.surgeryList.find(d => d.name == surgeryName).loading = false;
    })

    var line = svg.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 500).attr("stroke-width", 4).attr("stroke", "gray");
    var image = svg.append("image").attr("xlink:href", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=0").attr("x", 0).attr("y", 0);
    //var imageFrame = image.append("rect").attr("y", 0).attr("x", 0).attr("fill", "gray").attr("width", "100px").attr("height", "100px");

    var updateImage = (frameNr) => {
      image.attr("xlink:href", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=" + frameNr)
    }

    var drag = (d) => {
      var svgWidth = parseFloat(svg.style("width"));
      var lineX = parseFloat(line.attr("x1"))
      var newX = parseFloat(d3.event.x);

      line.attr("x1", newX < 0 ? 0 : newX > svgWidth ? svgWidth : newX).attr("x2", lineX < 0 ? 0 : newX > svgWidth ? svgWidth : newX);
      image.attr("x", newX < 0 ? 0 : newX > svgWidth ? svgWidth : newX);

      var updatedX = parseFloat(line.attr("x1"))
      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(updatedX / parseFloat(svg.style("width")) * 100));
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
    image.call(d3.drag().on("drag", drag))
  }

  public drawLineGraph(surgeryName: String) {
    var svg = d3.select('#' + surgeryName)
    svg.append("")
  }

  /*public expandCard(id: String) {
    console.log(id)
  }*/

}