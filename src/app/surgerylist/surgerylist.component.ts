import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PhasePercentage } from '../models/phasePercentage';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';
import { SurgeryScale } from '../models/surgeryScale';
import { DataService } from '../services/data.service';
import { Scale } from '../models/scale';
import { DeviceData } from '../models/DeviceData';
import { DeviceDataUnit } from '../models/deviceDataUnit';
import { isObject } from 'util';
import { PhaseCount } from '../models/phaseCount';

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

  // Positioning variables
  svgMargin = 30;
  cardBorder = 0.5;

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

  public loadSurgeryPhases(surgeryName: String) {
    this.dataService.getPhasesArray(surgeryName)
      .subscribe(response => {
        this.surgeryPhases.push(response); // TODO: check doubles
        this.calcPhasePercentage(surgeryName);
        this.fillPhasePercentageTable(surgeryName)
        this.loadDeviceData(surgeryName)
      })
  }

  public loadDeviceData(surgeryName: String) {
    this.dataService.getDeviceArray(surgeryName)
      .subscribe(response => {
        this.deviceData.push(response);
        this.calcDevicePercentage(surgeryName);
      })
  }

  public calcPhasePercentage(surgeryName: String) {
    var index = this.surgeryPhases.findIndex(d => d.name == surgeryName);
    var phases = this.surgeryPhases[index].phases;
    var result: PhaseCount[] = [];

    var currVal = -1;
    var currIndex = -1;
    for (var i in phases) {
      if (phases[i].phase != currVal) { // value changed
        currIndex++;
        currVal = phases[i].phase;
        result.push(new PhaseCount(currVal, 1))
      } else {
        result[currIndex].count = result[currIndex].count + 1;
      }
    }

    //console.log("THE RESULT FOR", surgeryName, result)

    var sum = 0
    result.map(d => sum += d.count)
    //console.log("SUM: " + sum)
    var scaleFunc = d3.scaleLinear().domain([0, sum]).range([0, 100]);

    this.scaleFunctions.push(new Scale(surgeryName, scaleFunc));

    var phasesScaled = []
    result.map(d => phasesScaled.push(new PhasePercentage(d.phaseNr, scaleFunc(d.count))))

    this.surgeryScale.push(new SurgeryScale(surgeryName, phasesScaled))

    this.drawBars(surgeryName);
  }

  public calcDevicePercentage(surgeryName: String) {
    var index = this.deviceData.findIndex(d => d.name == surgeryName);
    var length = this.deviceData[index].data.length;
    var svgWidth = parseFloat(d3.select('#' + surgeryName).style("width"));

    this.deviceData[index].data = this.createBinsMiddle(this.deviceData[index].data)
    //console.log(this.deviceData[index].data)

    var min = d3.min(this.deviceData[index].data, (d) => Number(d.thermoCurrGasFlow));
    var max = d3.max(this.deviceData[index].data, (d) => Number(d.thermoCurrGasFlow));

    var scaleFuncX = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    //var scaleFuncX2 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY = d3.scaleLinear().domain([0, 200]).range([200, 0]);

    var valueline = d3.line()
      .x(function (d, i) { return scaleFuncX(d.frame); })
      .y(function (d) { return scaleFuncY(d.thermoCurrGasFlow); })
    //.curve(d3.curveMonotoneX) // apply smoothing to the line

    var valueline2 = d3.line()
      .x(function (d, i) { return scaleFuncX(d.frame); })
      .y(function (d) { return scaleFuncY(d.thermoCurrGasPress); })

    var svg = d3.select('#graph1-' + surgeryName)
      .attr("transform", "translate(0, 10)");

    svg.append("path")
      .datum(this.deviceData[index].data)
      .attr("d", valueline)
      .attr("transform", "translate(" + this.svgMargin + ", 0)")
      .attr("fill", "none")
      .attr("stroke", "#ffab00")
      .attr("stroke-width", "1")

    svg.append("path")
      .datum(this.deviceData[index].data)
      .attr("d", valueline2)
      .attr("transform", "translate(" + this.svgMargin + ", 0)")
      .attr("fill", "none")
      .attr("stroke", "#ff00ff")
      .attr("stroke-width", "1")

    // Call the x axis in a group tag
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + this.svgMargin + ", 200)")
      .call(d3.axisBottom(scaleFuncX)); // Create an axis component with d3.axisBottom

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY)); // Create an axis component with d3.axisLeft
  }

  public createBinsMiddle(arr: DeviceDataUnit[]) {
    var nrBins = 150;
    var sum = 0;
    var firstPosition = 0;
    var newArr: DeviceDataUnit[] = []
    for (var i in arr) {
      sum += Number(arr[i].thermoCurrGasFlow);
      if (Number(i) - nrBins + 1 == firstPosition && Number(i) != 0) {
        var newUnit = arr[i];
        newUnit.thermoCurrGasFlow = sum / nrBins;
        newUnit.frame = firstPosition;
        newArr.push(newUnit);
        sum = 0;
        firstPosition = Number(i) + 1;
        if ((Number(i) + nrBins + 1 + 1) > arr.length) {
          nrBins = (Number(i) + nrBins + 1) - arr.length;
        }
      }
    }
    return newArr;
  }

  public createBinsMedian(arr: DeviceDataUnit[]) {
    var nrBins = 150;
    var bin = [];
    var firstPosition = 0;
    var newArr: DeviceDataUnit[] = [];
    for (var i in arr) {
      bin.push(Number(arr[i].thermoCurrGasFlow));
      if (Number(i) - nrBins + 1 == firstPosition && Number(i) != 0) {
        bin.sort(function (a, b) {
          return a - b;
        });
        var half = Math.floor(bin.length / 2);
        var newVal = 0;
        if (bin.length % 2)
          newVal = bin[half];
        else
          newVal = (bin[half - 1] + bin[half]) / 2.0;
        var newUnit = arr[i];
        newUnit.thermoCurrGasFlow = newVal;
        newUnit.frame = firstPosition;
        newArr.push(newUnit)
        bin = [];
        firstPosition = Number(i) + 1;
        if ((Number(i) + nrBins + 1 + 1) > arr.length) {
          nrBins = (Number(i) + nrBins + 1) - arr.length;
        }
      }
    }
    return newArr;
  }

  public

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
      .style("left", (this.svgMargin + this.cardBorder - 10) + "px")
      .style("top", "158.6px") // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 20
    var imgFrame = d3.select("#card-" + surgeryName).append("div")
      .attr("class", "imgFrame")
      .style("top", "86.96px") // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 71.64 - 20
      .style("left", (this.svgMargin + this.cardBorder - 10) + "px")
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
      svg.append('rect').attr("x", prevPos + "%").attr("y", 60).attr("width", d.percent + "%").attr("height", 40)
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
            .style("left", (rectCoords.x + (rectCoords.width / 2)) + "px") // minus padding
            .style("top", "141px"); // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 10 - 27.6
          tip.style("left", (rectCoords.x + (rectCoords.width / 2) + 25) + "px")
            .style("top", "168.6px"); // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 10
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
    // temporary solution
    var svg2 = d3.select('#graph1-' + surgeryName)
    var line2 = svg2.append("line").attr("x1", this.svgMargin + 1).attr("y1", -10).attr("x2", this.svgMargin + 1).attr("y2", 240).attr("stroke-width", "1px").attr("stroke", "dimgray");


    var updateImage = (frameNr) => {
      img.attr("src", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=" + frameNr)
    }

    var drag = () => {
      var svgWidth = parseFloat(svg.style("width"));
      var lineX = parseFloat(line.attr("x1"))
      var newX = parseFloat(d3.event.x);

      line.attr("x1", newX < 0 ? 0 : newX > svgWidth ? svgWidth : newX).attr("x2", newX < 0 ? 0 : newX > svgWidth ? svgWidth : newX);
      line2.attr("x1", Number(line.attr("x1")) + this.svgMargin + 0.5).attr("x2", Number(line.attr("x1")) + this.svgMargin + 0.5);

      var updatedX = parseFloat(line.attr("x1"))
      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(updatedX / parseFloat(svg.style("width")) * 100));
      //console.log("NEW FRAME " + frameNr)

      imgTip.style("left", (updatedX + this.svgMargin - 10) + "px")

      if ((updatedX + 102 - 10) <= svgWidth) {
        imgFrame.style("left", (updatedX + this.svgMargin - 10) + "px")
      } else {
        imgFrame.style("left", (svgWidth - 102 + this.svgMargin + 10) + "px")
      }

      frameField.html("Frame: " + frameNr);
      updateImage(frameNr);
    }

    svg.on("click", () => {
      var svgWidth = parseFloat(svg.style("width"));
      var newX = d3.mouse(svg.node())[0];
      //console.log(newX)
      line.raise().attr("x1", newX).attr("x2", newX);
      imgTip.style("left", (newX + this.svgMargin - 10) + "px")

      if ((newX + 102 - 10) <= svgWidth) {
        imgFrame.style("left", (newX + this.svgMargin - 10) + "px")
      } else {
        imgFrame.style("left", (svgWidth - 102 + this.svgMargin + 10) + "px")
      }

      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert(parseFloat(newX) / parseFloat(svg.style("width")) * 100));
      frameField.html("Frame: " + frameNr);
      updateImage(frameNr);
    });

    line.call(d3.drag().on("drag", drag))
    imgTip.call(d3.drag().on("drag", drag))
    imgFrame.call(d3.drag().on("drag", drag))
  }

  /*public drawLineGraph(surgeryName: String) {
    var svg = d3.select('#' + surgeryName)
    svg.append("")
  }*/

  public fillPhasePercentageTable(surgeryName: String) {
    var table = d3.select('#' + surgeryName + "-phasePercentage").select("tbody");
    var surgeryPhases = this.surgeryPhases.find(d => d.name == surgeryName);
    var nested = d3.nest().key(d => d.phase).rollup(v => v.length).entries(surgeryPhases.phases)

    var scaleFunction = this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale;

    var sum = 0
    nested.map(d => sum += nested.value)

    console.log(nested)
    nested.sort((a, b) => a.key - b.key)

    var phasesScaled = []
    nested.map((d) => {
      var dur = d.value / 25;
      var hours = Math.floor(dur / 3600);
      var minutes = Math.floor((dur / 60) % 60);
      var seconds = Math.floor(dur % 60);

      var hoursFormat = hours < 10 ? "0" + hours : hours;
      var minutesFormat = minutes < 10 ? "0" + minutes : minutes;
      var secondsFormat = seconds < 10 ? "0" + seconds : seconds;

      var percentageObj = new PhasePercentage(parseInt(d.key), scaleFunction(d.value))
      phasesScaled.push(percentageObj)
      var row = table.append('tr');
      row.append("th").attr("scope", "row").text(percentageObj.phaseNr);
      row.append("td").text(hoursFormat + ":" + minutesFormat + ":" + secondsFormat);
      row.append("td").text(percentageObj.percent.toFixed(2) + " %");
    })
  }

  /*public expandCard(id: String) {
    console.log(id)
  }*/

}