import { Component, OnInit } from '@angular/core';
import { csvParse, autoType } from 'd3';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-surgery-list',
  templateUrl: './surgery-list.component.html',
  styleUrls: ['./surgery-list.component.css']
})
export class SurgeryListComponent implements OnInit {

  videoMetadata;

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.getVideoMetadata().subscribe(response => {
      this.videoMetadata = csvParse(response, autoType);
    })
  }

}
