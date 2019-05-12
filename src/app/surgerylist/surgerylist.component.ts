import { Component, OnInit } from '@angular/core';
import { SurgeryPhases } from '../models/surgeryPhases';
import { DataService } from '../services/data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-surgerylist',
  templateUrl: './surgerylist.component.html',
  styleUrls: ['./surgerylist.component.css']
})
export class SurgerylistComponent implements OnInit {

  surgeryList: String[] = [];

  surgeryPhases: SurgeryPhases[] = []

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadSurgeryList();
  }

  public loadSurgeryList() {
    this.dataService.getSurgeryList()
      .subscribe(response => {
        this.surgeryList = response;
      })
  }


}
