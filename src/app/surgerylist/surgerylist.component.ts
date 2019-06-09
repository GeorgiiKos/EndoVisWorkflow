import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PhasePercentage } from '../models/phasePercentage';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';
import { SurgeryScale } from '../models/surgeryScale';
import { DataService } from '../services/data.service';
import { Scale } from '../models/scale';
import { DeviceData } from '../models/DeviceData';

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

    // Define container for image tooltip
    var imgTip = d3.select("#card-" + surgeryName).append("div")
      .attr("class", "imgTip")
      .style("left", "10px")
      .style("top", "148.6px") // 20 + 24 + 12 - 6 + 20.6 + 8 + 90 - 20
    var imgFrame = d3.select("#card-" + surgeryName).append("div")
      .attr("class", "imgFrame")
      .style("top", "76.6px") // 20 + 24 + 12 - 6 + 20.6 + 8 + 90 - 72 - 20
      .style("left", "10px")
    var img = imgFrame.append("img")
      .attr("class", "img")
      .attr("src", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=0")
      .style("width", "96px")
      .style("height", "54px")
    var details = imgFrame.append("div")
    var frameField = details.append("div").html("Frame: 0").style("display", "inline-block");
    //var phaseField = details.append("div").html("Phase: 0").style("display", "inline-block").style("padding-left", "20px");

    var svg = d3.select('#' + surgeryName)  // find the right svg
    var prevPos = 0
    this.surgeryScale.find(d => d.name == surgeryName).percentage.map(d => {
      svg.append('rect').attr("x", prevPos + "%").attr("y", 90).attr("width", d.percent + "%").attr("height", 40)
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
            .style("top", "131px"); // 20 + 24 + 12 - 6 + 20.6 + 8 + 90 - 10 - 27.6
          tip.style("left", (rectCoords.x + (rectCoords.width / 2) - 10 + 25) + "px")
            .style("top", "158.6px"); // 20 + 24 + 12 - 6 + 20.6 + 8 + 90 - 10
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

    var line = svg.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 500).attr("stroke-width", "1px").attr("stroke", "dimgray");

    var updateImage = (frameNr) => {
      img.attr("src", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=" + frameNr)
    }

    var drag = () => {
      var svgWidth = parseFloat(svg.style("width"));
      var lineX = parseFloat(line.attr("x1"))
      var newX = parseFloat(d3.event.x);

      line.attr("x1", newX < 0 ? 0 : newX > svgWidth ? svgWidth : newX).attr("x2", newX < 0 ? 0 : newX > svgWidth ? svgWidth : newX);

      var updatedX = parseFloat(line.attr("x1"))
      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(updatedX / parseFloat(svg.style("width")) * 100));
      console.log("NEW FRAME " + frameNr)

      imgTip.style("left", (updatedX + 10) + "px")

      if ((updatedX + 102 - 20) <= svgWidth) {
        imgFrame.style("left", (updatedX + 10) + "px")
      } else {
        imgFrame.style("left", (svgWidth - 102 + 30) + "px")
      }

      frameField.html("Frame: " + frameNr);
      updateImage(frameNr);
    }

    svg.on("click", () => {
      var svgWidth = parseFloat(svg.style("width"));
      var newX = d3.mouse(svg.node())[0];
      console.log(newX)
      line.raise().attr("x1", newX).attr("x2", newX);
      imgTip.style("left", (newX + 10) + "px")

      if ((newX + 102 - 20) <= svgWidth) {
        imgFrame.style("left", (newX + 10) + "px")
      } else {
        imgFrame.style("left", (svgWidth - 102 + 30) + "px")
      }

      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(parseFloat(newX) / parseFloat(svg.style("width")) * 100));
      updateImage(frameNr);
    });

    line.call(d3.drag().on("drag", drag))
    imgTip.call(d3.drag().on("drag", drag))
    imgFrame.call(d3.drag().on("drag", drag))
  }

  public drawLineGraph(surgeryName: String) {
    var svg = d3.select('#' + surgeryName)
    svg.append("")
  }

  /*public expandCard(id: String) {
    console.log(id)
  }*/

}