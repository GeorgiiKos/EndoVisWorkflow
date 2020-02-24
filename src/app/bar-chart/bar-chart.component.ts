import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { csvParse, stack } from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  @Input() name: string;
  private phases = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getPhaseAnnotation(this.name).subscribe(response => {
      var header = ['frame', 'phase'].join(',') + '\n'
      var jsonObj = csvParse(header + response)
      this.calcInPercent(jsonObj)
    })
  }

  private calcInPercent(array) {
    // var currVal = -1;
    // var obj;
    // for (var i in array) {
    //   if (array[i].phase != currVal) { // value changed
    //     if (currVal != -1) {
    //       this.phases.push(obj)
    //     }
    //     currVal = array[i].phase;
    //     obj = { phase: currVal, count: 1 }
    //   } else {
    //     obj.count = obj.count + 1;
    //   }
    // }

    var stack1 = stack()
      .keys(["phase"])

      this.phases = stack1(array);
  }

}
