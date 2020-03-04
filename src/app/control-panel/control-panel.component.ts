import { Component, Input, OnInit } from '@angular/core';
import { select, selectAll } from 'd3';
import { ScaleService } from '../services/scale.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {

  @Input() videoMetadata;

  constructor(private scales: ScaleService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.drawSelectionTable();
  }

  private drawSelectionTable() {
    var selectionTable = select(`#selection-table-${this.videoMetadata.name}`);
    var labels = selectionTable.selectAll('.form-check-label');
    var colorScale = this.scales.deviceDataColorScale;

    // add color labels
    labels.append('span')
      .style('display', 'inline-block')
      .style('height', '.7rem')
      .style('width', '.7rem')
      .style('background-color', function (d) {
        var checkboxValue = select(this.parentNode).select('input').attr('value');  // search neighboring input tag and read its value
        return colorScale(checkboxValue);
      });

    // add click behavior
    labels.select('input').on('change', function (d) {
      var checkbox = select(this);
      if (checkbox.property('checked')) {
        select(`#${checkbox.attr('value')}`).attr('visibility', 'visible');
      } else {
        select(`#${checkbox.property('value')}`).attr('visibility', 'hidden');
      };
    })

    // further options
    var range = selectionTable.select(`#lineWidth-${this.videoMetadata.name}`);
    range.on('input', (d) => {
      selectAll(`.line-${this.videoMetadata.name}`).style('stroke-width', range.property('value'))
    });
  }

}
