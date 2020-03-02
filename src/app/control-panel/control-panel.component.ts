import { Component, OnInit, Input } from '@angular/core';
import { ascending, descending, nest, range, scan, select, selectAll } from 'd3';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {

  @Input() videoMetadata;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.drawSelectionTable();
  }

  private drawSelectionTable() {
    var selectionTable = select(`#selection-table-${this.videoMetadata.name}`);
    var inputs = selectionTable.selectAll('.form-check')
    inputs.append('div').attr('class', 'test')  // TODO: add colors
    inputs.select('input').on("change", function (d) {
      var checkbox = select(this);
      if (checkbox.property('checked')) {
        select(`#${checkbox.attr('value')}`).attr('visibility', 'visible')
      } else {
        select(`#${checkbox.property('value')}`).attr('visibility', 'hidden')
      }
    })

    var range = selectionTable.select(`#lineWidth-${this.videoMetadata.name}`)

    range.on('input', (d) => {
      selectAll(`.line-${this.videoMetadata.name}`).style('stroke-width', range.property('value'))
    })
  }

}
