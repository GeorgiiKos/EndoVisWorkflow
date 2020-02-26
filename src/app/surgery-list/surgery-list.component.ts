import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ascending, autoType, csvParse, descending } from 'd3';
import { DataService } from '../services/data.service';
import { SurgeryListItemComponent } from '../surgery-list-item/surgery-list-item.component';

@Component({
  selector: 'app-surgery-list',
  templateUrl: './surgery-list.component.html',
  styleUrls: ['./surgery-list.component.css']
})
export class SurgeryListComponent implements OnInit {

  @ViewChildren(SurgeryListItemComponent)
  surgeryListItems: QueryList<SurgeryListItemComponent>;


  public videoMetadata;

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.getVideoMetadata().subscribe(response => {
      this.videoMetadata = csvParse(response, autoType);
    })
  }

  public sortMetadata(column: string, asc: boolean) {
    var regex = /([A-Z][a-z]+)(\d+)/i;

    if (column === 'name') {  // special case for name
      if (asc) {
        this.videoMetadata.sort((a, b) => ascending(a[column].match(regex)[1], b[column].match(regex)[1])
          || ascending(parseInt(a[column].match(regex)[2]), parseInt(b[column].match(regex)[2])));
      } else {
        this.videoMetadata.sort((a, b) => descending(a[column].match(regex)[1], b[column].match(regex)[1])
          || descending(parseInt(a[column].match(regex)[2]), parseInt(b[column].match(regex)[2])));
      }
    } else {
      if (asc) {
        this.videoMetadata.sort((a, b) => ascending(a[column], b[column]))
      } else {
        this.videoMetadata.sort((a, b) => descending(a[column], b[column]))
      }
    }
  }

  public collapseAll() {
    this.surgeryListItems.forEach((e) => {
      e.cardExpanded = false;
      e.child.hideContent()
    });
  }
}
