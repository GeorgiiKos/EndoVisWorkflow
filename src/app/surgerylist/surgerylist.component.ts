import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PhasePercentage } from '../models/phasePercentage';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';
import { SurgeryScale } from '../models/surgeryScale';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-surgerylist',
  templateUrl: './surgerylist.component.html',
  styleUrls: ['./surgerylist.component.css']
})
export class SurgerylistComponent implements OnInit {

  surgeryList: Surgery[] = [];
  surgeryPhases: SurgeryPhases[] = []
  surgeryScale: SurgeryScale[] = []

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadSurgeryList();
  }

  public loadSurgeryList() {
    this.dataService.getSurgeryList()
      .subscribe(response => {
        this.surgeryList = response;
        for (let i in this.surgeryList) {
          console.log('GET PHASES FOR ', this.surgeryList[i])
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
    var res = d3.nest().key((d) => { return d[1] }).rollup((v) => { return v.length }).entries(this.surgeryPhases[index].phases);


    var sum = 0
    res.map(d => sum += d.value)
    var scaled = d3.scaleLinear().domain([0, sum]).range([0, 100]);

    var phasesScaled = []
    res.map(d => phasesScaled.push(new PhasePercentage(d.key, scaled(d.value))))
    console.log(phasesScaled)

    this.surgeryScale.push(new SurgeryScale(surgeryName, phasesScaled))

    this.drawBars(surgeryName);
  }

  public drawBars(surgeryName: String) {
    var prevPos = 0
    this.surgeryScale.find(d => d.name == surgeryName).percentage.map(d => {
      d3.select('#' + surgeryName).append('rect').attr("x", prevPos + "%").attr("width", d.percent + "%").attr("height", 40).attr("fill", () => {
        switch (Number(d.phaseNr)) {
          case 0:
            return "red"
          case 1:
            return "green"
          case 2:
            return "blue"
          case 3:
            return "white"
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
  }
}