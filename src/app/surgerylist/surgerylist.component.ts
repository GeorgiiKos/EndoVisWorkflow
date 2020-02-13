import { Component, OnInit, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { PhasePercentage } from '../models/phasePercentage';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';
import { SurgeryScale } from '../models/surgeryScale';
import { DataService } from '../services/data.service';
import { Scale } from '../models/scale';
import { DeviceData } from '../models/DeviceData';
import { DeviceDataUnit } from '../models/deviceDataUnit';
import { PhaseCount } from '../models/phaseCount';
import { InstrumentAnnotation } from '../models/instrumentAnnotation';
import colors from "../../colors.json";

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

  instrumentData: InstrumentAnnotation[] = []

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
          this.surgeryList[i].collapsed = true
          this.loadSurgeryPhases(this.surgeryList[i].name)
          this.loadInstruments(this.surgeryList[i].name)
        }
      })
  }

  public loadSurgeryPhases(surgeryName: string) {
    this.dataService.getPhasesArray(surgeryName)
      .subscribe(response => {
        this.surgeryPhases.push(response); // TODO: check doubles
        this.calcPhasePercentage(surgeryName);
        this.fillPhasePercentageTable(surgeryName)
        this.loadDeviceData(surgeryName)
      })
  }

  public loadDeviceData(surgeryName: string) {
    this.dataService.getDeviceArray(surgeryName)
      .subscribe(response => {
        this.deviceData.push(response);
        this.drawDeviceAxes(surgeryName)
        this.drawDeviceGraph(surgeryName, "thermoCurrGasFlow");
      })
  }

  public loadInstruments(surgeryName: string) {
    this.dataService.getInstumentArray(surgeryName)
      .subscribe(response => {
        this.instrumentData.push(response);
        this.drawInstrumentGraph(surgeryName)
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


    var sum = 0
    result.map(d => sum += d.count)
    var scaleFunc = d3.scaleLinear().domain([0, sum]).range([0, 100]);

    this.scaleFunctions.push(new Scale(surgeryName, scaleFunc));

    var phasesScaled = []
    result.map(d => phasesScaled.push(new PhasePercentage(d.phaseNr, scaleFunc(d.count))))

    this.surgeryScale.push(new SurgeryScale(surgeryName, phasesScaled))

    this.drawBars(surgeryName);
  }

  public drawDeviceAxes(surgeryName: string) {
    var index = this.deviceData.findIndex(d => d.name == surgeryName);
    var length = this.deviceData[index].data.length;
    var svgWidth = parseFloat(d3.select('#' + surgeryName).style("width")) - (this.svgMargin * 2);

    var scaleFuncX1 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY1 = d3.scaleLinear().domain([-1, 300]).range([150, 0]);

    var scaleFuncX2 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY2 = d3.scaleLinear().domain([-1, 7500]).range([150, 0]);

    var scaleFuncX3 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY3 = d3.scaleLinear().domain([-1, 1]).range([150, 0]);

    var svg1 = d3.select('#graph1-' + surgeryName)
      .attr("transform", "translate(0, 10)");
    var svg2 = d3.select('#graph2-' + surgeryName)
      .attr("transform", "translate(0, 10)");
    var svg3 = d3.select('#graph3-' + surgeryName)
      .attr("transform", "translate(0, 10)");

    // Call the x axis in a group tag
    svg1.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(" + this.svgMargin + ", 150)")
      .call(d3.axisBottom(scaleFuncX1)); // Create an axis component with d3.axisBottom

    svg1.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY1)); // Create an axis component with d3.axisLeft

    // Call the x axis in a group tag
    svg2.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(" + this.svgMargin + ", 150)")
      .call(d3.axisBottom(scaleFuncX2)); // Create an axis component with d3.axisBottom

    svg2.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY2).ticks(16).tickFormat(d3.format(".2s"))); // Create an axis component with d3.axisLeft

    // Call the x axis in a group tag
    svg3.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(" + this.svgMargin + ", 150)")
      .call(d3.axisBottom(scaleFuncX3)); // Create an axis component with d3.axisBottom

    svg3.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY3)); // Create an axis component with d3.axisLeft

    // add horizontal grid
    svg1.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY1)
        .tickSize(-svgWidth)
        .tickFormat(""));

    d3.selectAll(".grid line").style("stroke", "lightgrey");
    d3.selectAll(".grid path").style("stroke-width", "0");

    svg2.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY2)
        .ticks(16)
        .tickSize(-svgWidth)
        .tickFormat(""));

    d3.selectAll(".grid line").style("stroke", "lightgrey");
    d3.selectAll(".grid path").style("stroke-width", "0");

    svg3.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY3)
        .tickSize(-svgWidth)
        .tickFormat(""));

    d3.selectAll(".grid line").style("stroke", "lightgrey");
    d3.selectAll(".grid path").style("stroke-width", "0");
  }

  public drawDeviceGraph(surgeryName: string, graph: string) {
    var index = this.deviceData.findIndex(d => d.name == surgeryName);
    var length = this.deviceData[index].data.length;
    var svgWidth = parseFloat(d3.select('#' + surgeryName).style("width")) - (this.svgMargin * 2);

    var binnedData = this.createBinsAverage(this.deviceData[index].data, graph)
    //var binnedData = this.deviceData[index].data

    //var min = d3.min(this.deviceData[index].data, (d) => Number(d.thermoCurrGasFlow));
    //var max = d3.max(this.deviceData[index].data, (d) => Number(d.thermoCurrGasFlow));

    var scaleFuncX1 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY1 = d3.scaleLinear().domain([-1, 300]).range([150, 0]);

    var scaleFuncX2 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY2 = d3.scaleLinear().domain([-1, 7500]).range([150, 0]);

    var scaleFuncX3 = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY3 = d3.scaleLinear().domain([-1, 1]).range([150, 0]);

    var svg1 = d3.select('#graph1-' + surgeryName);
    var svg2 = d3.select('#graph2-' + surgeryName)
    var svg3 = d3.select('#graph3-' + surgeryName)

    var drawLine = (data: DeviceDataUnit[], valueline: any, svg: any, color: string, id: string) => {
      svg.append("path")
        .datum(data)
        .attr("d", valueline)
        .attr("transform", "translate(" + this.svgMargin + ", 0)")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", "2")
        .attr("id", id)
    }

    switch (graph) {
      case "thermoCurrGasFlow":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.thermoCurrGasFlow); })
        drawLine(binnedData, valueline, svg1, "#f50000", "path-thermoCurrGasFlow-" + surgeryName);
        break;
      case "thermoTarGasFlow":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.thermoTarGasFlow); })
        drawLine(binnedData, valueline, svg1, "#b800a7", "path-thermoTarGasFlow-" + surgeryName);
        break;
      case "thermoCurrGasPress":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.thermoCurrGasPress); })
        drawLine(binnedData, valueline, svg1, "#a400ff", "path-thermoCurrGasPress-" + surgeryName);
        break;
      case "thermoTarGasPress":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.thermoTarGasPress); })
        drawLine(binnedData, valueline, svg1, "#5b009c", "path-thermoTarGasPress-" + surgeryName);
        break;
      case "thermoGasVol":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX2(d.frame); })
          .y(function (d) { return scaleFuncY2(d.thermoGasVol); })
        drawLine(binnedData, valueline, svg2, "#0000ff", "path-thermoGasVol-" + surgeryName);
        break;
      case "thermoGasSupplPres":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX2(d.frame); })
          .y(function (d) { return scaleFuncY2(d.thermoGasSupplPres); })
        drawLine(binnedData, valueline, svg2, "#259f9f", "path-thermoGasSupplPres-" + surgeryName);
        break;
      case "thermoDeviceOn":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX3(d.frame); })
          .y(function (d) { return scaleFuncY3(d.thermoDeviceOn); })
        drawLine(binnedData, valueline, svg3, "#196900", "path-thermoDeviceOn-" + surgeryName);
        break;
      case "orLightsOff":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX3(d.frame); })
          .y(function (d) { return scaleFuncY3(d.orLightsOff); })
        drawLine(binnedData, valueline, svg3, "#3eff00", "path-orLightsOff-" + surgeryName);
        break;
      case "orLightsIntLight1":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.orLightsIntLight1); })
        drawLine(binnedData, valueline, svg1, "#ffff00", "path-orLightsIntLight1-" + surgeryName);
        break;
      case "orLightsIntLight2":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.orLightsIntLight2); })
        drawLine(binnedData, valueline, svg1, "#f9a700", "path-orLightsIntLight2-" + surgeryName);
        break;
      case "endLightSourceIntens":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX1(d.frame); })
          .y(function (d) { return scaleFuncY1(d.endLightSourceIntens); })
        drawLine(binnedData, valueline, svg1, "#f76c00", "path-endLightSourceIntens-" + surgeryName);
        break;
      case "endWhiteBal":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX3(d.frame); })
          .y(function (d) { return scaleFuncY3(d.endWhiteBal); })
        drawLine(binnedData, valueline, svg3, "#f53200", "path-endWhiteBal-" + surgeryName);
        break;
      case "endGains":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX2(d.frame); })
          .y(function (d) { return scaleFuncY2(d.endGains); })
        drawLine(binnedData, valueline, svg2, "#696969", "path-endGains-" + surgeryName);
        break;
      case "endExposureIndex":
        var valueline = d3.line()
          .x(function (d, i) { return scaleFuncX2(d.frame); })
          .y(function (d) { return scaleFuncY2(d.endExposureIndex); })
        drawLine(binnedData, valueline, svg2, "#000000", "path-endExposureIndex-" + surgeryName);
        break;
    }
  }

  public createBinsAverage(arr: DeviceDataUnit[], graph: string) {
    var nrBins = 150;
    var sum = 0;
    var firstPosition = 0;
    var newArr: DeviceDataUnit[] = []
    for (var i in arr) {
      sum += Number(arr[i][graph]);
      if (Number(i) - nrBins + 1 == firstPosition && Number(i) != 0) {
        var newUnit = arr[i];
        newUnit[graph] = sum / nrBins;
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
      .style("left", (this.svgMargin - 10) + "px")
      .style("top", "158.6px") // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 20
    var imgFrame = d3.select("#card-" + surgeryName).append("div")
      .attr("class", "imgFrame")
      .style("top", "86.96px") // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 71.64 - 20
      .style("left", (this.svgMargin - 10) + "px")
    var img = imgFrame.append("img")
      .attr("class", "img")
      .attr("src", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=0")
      .style("width", "96px")
      .style("height", "54px")
    var details = imgFrame.append("div")
    var frameField = details.append("div").html("Frame: 0").style("display", "inline-block");

    var svg = d3.select('#' + surgeryName)  // find the right svg
    var svgWidth = parseFloat(svg.style("width"));

    var prevPos = 30
    this.surgeryScale.find(d => d.name == surgeryName).percentage.map(d => {
      svg.append('rect').attr("x", prevPos).attr("y", 60).attr("width", (svgWidth - 60) * (d.percent / 100)).attr("height", 40)
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
            .style("left", (rectCoords.x + (rectCoords.width / 2)) - 30 + "px") // minus padding
            .style("top", "141px"); // 30 + 24 + 12 - 6 + 20.6 + 8 + 30 + 60 - 10 - 27.6
          tip.style("left", (rectCoords.x + (rectCoords.width / 2) + 25) - 30 + "px")
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
              return "#f50000"
            case 1:
              return "#b800a7"
            case 2:
              return "#a400ff"
            case 3:
              return "#5b009c"
            case 4:
              return "#f9a700"
            case 5:
              return "#259f9f"
            case 6:
              return "#196900"
            case 7:
              return "#3eff00"
            case 8:
              return "#ffff00"
            case 9:
              return "#0000ff"
            case 10:
              return "#f76c00"
            case 11:
              return "#f53200"
            case 12:
              return "#696969"
            case 13:
              return "#000000"
          }
        })
      prevPos = prevPos + (svgWidth - 60) * (d.percent / 100);
      this.surgeryList.find(d => d.name == surgeryName).loading = false;
    })

    var line = svg.append("line").attr("x1", this.svgMargin).attr("y1", 0).attr("x2", this.svgMargin).attr("y2", 500).attr("stroke-width", "1px").attr("stroke", "dimgray");
    // temporary solution
    var svg2 = d3.select('#graph1-' + surgeryName + "-svg")
    var svg3 = d3.select('#graph2-' + surgeryName + "-svg")
    var svg4 = d3.select('#graph3-' + surgeryName + "-svg")
    var svg5 = d3.select('#graph4-' + surgeryName + "-svg")
    var line2 = svg2.append("line").attr("x1", this.svgMargin).attr("y1", -10).attr("x2", this.svgMargin).attr("y2", 180).attr("stroke-width", "1px").attr("stroke", "dimgray");
    var line3 = svg3.append("line").attr("x1", this.svgMargin).attr("y1", -10).attr("x2", this.svgMargin).attr("y2", 180).attr("stroke-width", "1px").attr("stroke", "dimgray");
    var line4 = svg4.append("line").attr("x1", this.svgMargin).attr("y1", -10).attr("x2", this.svgMargin).attr("y2", 180).attr("stroke-width", "1px").attr("stroke", "dimgray");
    var line5 = svg5.append("line").attr("x1", this.svgMargin).attr("y1", -10).attr("x2", this.svgMargin).attr("y2", 180).attr("stroke-width", "1px").attr("stroke", "dimgray");


    var updateImage = (frameNr) => {
      img.attr("src", "http://localhost:8000/api/getImage?surgeryName=" + surgeryName + "&frame=" + frameNr)
    }

    var drag = () => {
      var svgWidth = parseFloat(svg.style("width"));
      var lineX = parseFloat(line.attr("x1"))
      var newX = parseFloat(d3.event.x);

      line.attr("x1", newX < this.svgMargin ? this.svgMargin : newX > svgWidth - this.svgMargin ? svgWidth - this.svgMargin : newX).attr("x2", newX < this.svgMargin ? this.svgMargin : newX > svgWidth - this.svgMargin ? svgWidth - this.svgMargin : newX);
      var updatedX = parseFloat(line.attr("x1"))
      line2.attr("x1", updatedX).attr("x2", updatedX);
      line3.attr("x1", updatedX).attr("x2", updatedX);
      line4.attr("x1", updatedX).attr("x2", updatedX);
      line5.attr("x1", updatedX).attr("x2", updatedX);


      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert((updatedX - this.svgMargin) / (parseFloat(svg.style("width")) - (this.svgMargin * 2)) * 100));

      imgTip.style("left", (updatedX - 10) + "px")

      if ((updatedX + 102 - 20 - this.svgMargin) <= svgWidth - 60) {
        imgFrame.style("left", (updatedX - 10) + "px")
      } else {
        imgFrame.style("left", (svgWidth - 102 - 20) + "px")
      }

      frameField.html("Frame: " + frameNr);
      updateImage(frameNr);
    }

    var click = () => {
      var svgWidth = parseFloat(svg.style("width"));
      var newX = d3.mouse(svg.node())[0];

      line.attr("x1", newX < this.svgMargin ? this.svgMargin : newX > svgWidth - this.svgMargin ? svgWidth - this.svgMargin : newX).attr("x2", newX < this.svgMargin ? this.svgMargin : newX > svgWidth - this.svgMargin ? svgWidth - this.svgMargin : newX);
      var updatedX = parseFloat(line.attr("x1"))
      line2.attr("x1", updatedX).attr("x2", updatedX);
      line3.attr("x1", updatedX).attr("x2", updatedX);
      line4.attr("x1", updatedX).attr("x2", updatedX);
      line5.attr("x1", updatedX).attr("x2", updatedX);

      imgTip.style("left", (updatedX - 10) + "px")

      if ((updatedX + 102 - 20 - this.svgMargin) <= svgWidth - 60) {
        imgFrame.style("left", (updatedX - 10) + "px")
      } else {
        imgFrame.style("left", (svgWidth - 102 - 20) + "px")
      }

      var frameNr = Math.round(this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale.invert((updatedX - this.svgMargin) / (parseFloat(svg.style("width")) - (this.svgMargin * 2)) * 100));
      frameField.html("Frame: " + frameNr);
      updateImage(frameNr);
    };

    svg.on("click", click)
    svg2.on("click", click)
    svg3.on("click", click)
    svg4.on("click", click)
    svg5.on("click", click)


    line.call(d3.drag().on("drag", drag))
    line2.call(d3.drag().on("drag", drag))
    line3.call(d3.drag().on("drag", drag))
    line4.call(d3.drag().on("drag", drag))
    imgTip.call(d3.drag().on("drag", drag))
    imgFrame.call(d3.drag().on("drag", drag))
  }

  public fillPhasePercentageTable(surgeryName: String) {
    var table = d3.select('#' + surgeryName + "-phasePercentage").select("tbody");
    var surgeryPhases = this.surgeryPhases.find(d => d.name == surgeryName);
    var nested = d3.nest().key(d => d.phase).rollup(v => v.length).entries(surgeryPhases.phases)

    var scaleFunction = this.scaleFunctions.find(d => d.surgeryName == surgeryName).scale;

    var sum = 0
    nested.map(d => sum += nested.value)

    //nested = nested.sort((a, b) => a.value - b.value)

    var display = (data) => {

      for (var i = 0; i < 14; i++) {
        var foundObj = data.find((d => d.key == i));
        if (foundObj !== undefined) {
          var dur = foundObj.value / 25;
          var hours = Math.floor(dur / 3600);
          var minutes = Math.floor((dur / 60) % 60);
          var seconds = Math.floor(dur % 60);

          var hoursFormat = hours < 10 ? "0" + hours : hours;
          var minutesFormat = minutes < 10 ? "0" + minutes : minutes;
          var secondsFormat = seconds < 10 ? "0" + seconds : seconds;

          var percentageObj = new PhasePercentage(parseInt(foundObj.key), scaleFunction(foundObj.value))

          var row = table.append('tr');
          var th = row.append("th").attr("scope", "row").text(percentageObj.phaseNr);
          row.append("td").text(hoursFormat + ":" + minutesFormat + ":" + secondsFormat + " (" + percentageObj.percent.toFixed(2) + "%)");
        } else {
          var row = table.append('tr').style("background-color", "#ffe5e5");
          row.append("th").attr("scope", "row").text(i);
          row.append("td").text("Phase was neglected!");
        }
      }
    }
    display(nested)
  }

  public checkedEvent(event: any, surgeryName: string, graph: string) {
    if (!event.currentTarget.checked) {
      d3.select("#path-" + graph + "-" + surgeryName).remove()
    } else {
      this.drawDeviceGraph(surgeryName, graph)
    }
  }

  public collapseDiv(id: string) {
    var index = this.surgeryList.findIndex(d => d.name == id);
    if (this.surgeryList[index].collapsed) {
      d3.select("#expand-" + id).style("display", "")
      d3.select("#btn-" + id).text("Close");
      this.surgeryList[index].collapsed = false;
    } else {
      d3.select("#btn-" + id).text("Details");
      d3.select("#expand-" + id).style("display", "none");
      this.surgeryList[index].collapsed = true;

    }
  }

  public drawInstrumentGraph(surgeryName: string) {

    var tmp = [
      "Grasper",
      "Harmonic Scalpel",
      "J-hook",
      "Ligasure",
      "Scissors",
      "Stapler",
      "Aspirator",
      "Swapholder",
      "Silicone Drain",
      "Clipper",
      "I-Hook",
      "Needle Holder"
    ]


    var svg = d3.select('#graph4-' + surgeryName).attr("transform", "translate(0, 10)")
    var index = this.surgeryList.findIndex(d => d.name == surgeryName);
    var length = this.surgeryList[index].numFrames;
    var svgWidth = parseFloat(d3.select('#' + surgeryName).style("width")) - (this.svgMargin * 2);

    var scaleFuncX = d3.scaleLinear().domain([0, length]).range([0, svgWidth]);
    var scaleFuncY = d3.scaleBand().domain(tmp).range([150, 0])

    var instruments = this.instrumentData.find(d => d.name == surgeryName).data;


    // Call the x axis in a group tag
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(" + this.svgMargin + ", 150)")
      .call(d3.axisBottom(scaleFuncX)); // Create an axis component with d3.axisBottom

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + this.svgMargin + " ,0)")
      .call(d3.axisLeft(scaleFuncY)); // Create an axis component with d3.axisLeft

    svg.selectAll(".y-axis .tick:not(:first-child) text").attr("x", -25).style('text-anchor', 'start');
    svg.select(".y-axis .domain").remove();
    svg.selectAll(".y-axis .tick line").remove(); // temporary solution


    for (let i in instruments) {
      if (instruments[i].grasper == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Grasper"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color1);
      }
      if (instruments[i].harmonicScalpel == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Harmonic Scalpel"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color2);
      }
      if (instruments[i].j_hook == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("J-hook"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color3);
      }
      if (instruments[i].ligasure == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Ligasure"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color4);
      }
      if (instruments[i].scissors == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Scissors"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color5);
      }
      if (instruments[i].stapler == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Stapler"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color6);
      }
      if (instruments[i].aspirator == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Aspirator"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color7);
      }
      if (instruments[i].swapholder == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Swapholder"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color8);
      }
      if (instruments[i].siliconeDrain == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Silicone Drain"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color9);
      }
      if (instruments[i].clipper == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("Clipper"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color10);
      }
      if (instruments[i].i_hook == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("I-Hook"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color11);
      }
      if (instruments[i].needleHolder == 1) {
        svg.append("rect")
          .attr("transform", "translate(" + this.svgMargin + " ,0)")
          .attr("class", "bar")
          .attr("x", function (d) { return scaleFuncX(instruments[i].frame); })
          .attr("width", function (d) { return scaleFuncX(1500); })
          .attr("y", function (d) { return scaleFuncY("NeedleHolder"); })
          .attr("height", scaleFuncY.bandwidth())
          .attr("fill", colors.color12);
      }
    }
  }

  public sortSurgeries(name: string, asc: boolean) {
    if (name == "duration") {
      this.surgeryList.sort((a, b) => {
        var date1 = new Date("1970-01-01T" + a.h + ":" + a.m + ":" + a.s + "Z")
        var date2 = new Date("1970-01-01T" + b.h + ":" + b.m + ":" + b.s + "Z")
        if (asc) {
          return date1 < date2 ? -1 :
            (date1 > date2 ? 1 : 0);
        } else {
          return date1 < date2 ? 1 :
            (date1 > date2 ? -1 : 0);
        }
      })
    } else if (name == "name") {
      this.surgeryList.sort((a, b) => {
        if (asc) {
          return a.name < b.name ? -1 :
            (a.name > b.name ? 1 : 0);
        } else {
          return a.name < b.name ? 1 :
            (a.name > b.name ? -1 : 0);
        }
      })
    }
  }
}