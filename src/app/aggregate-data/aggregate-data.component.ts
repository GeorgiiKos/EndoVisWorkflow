import { Component, Input, NgZone, OnInit } from '@angular/core';
import { ascending, descending, nest, range, scan, select } from 'd3';

@Component({
  selector: 'app-aggregate-data',
  templateUrl: './aggregate-data.component.html',
  styleUrls: ['./aggregate-data.component.css']
})
export class AggregateDataComponent implements OnInit {

  // videoMetadata object passed from parent component
  @Input() videoMetadata;
  @Input() phaseAnnotation;

  constructor(private zone: NgZone) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.drawTable();
  }

  private drawTable() {
    var data = this.addMissingPhases(this.groupByPhase());
    var longestPhase = data[scan(data, function (a, b) { return descending(a.Percentage, b.Percentage); })].Phase;

    var columns = ['Phase', 'Percentage'];

    var sortAscending = false;

    var table = select(`#table-${this.videoMetadata.name}`);
    var thead = table.append('thead').style('user-select', 'none').style('cursor', 'pointer');
    var tbody = table.append('tbody').style('font-size', '0.8rem');

    // append the header row
    thead = thead.append('tr')
      .selectAll('th')
      .data(columns)
      .enter()
      .append('th')
      .text((column) => column)
      .attr('class', 'header')
      .attr('class', (d, i) => d === 'Phase' ? 'asc' : '');  // display arrow

    // add event listeners outside angular change detection zone
    this.zone.runOutsideAngular(() => {
      thead.on('click', function (d) {  // sort table
        thead.attr('class', 'header')  // remove classes
        thead.classed('des', false);
        if (sortAscending) {
          rows.sort(function (a, b) { return ascending(a[d], b[d]); });
          sortAscending = false;
          this.className = 'asc';
        } else {
          rows.sort(function (a, b) { return descending(a[d], b[d]); });
          sortAscending = true;
          this.className = 'desc';
        }
      });
    });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr')
      .sort(function (a, b) { return ascending(a.Phase, b.Phase); });

    // create cell for each attribute
    var cells = rows.selectAll('td')
      .data((row) => {  // function evaluates data passed from rows
        return columns.map((column) => {
          switch (column) {
            case ("Phase"):
              return { column: column, value: row[column] };
            case ("Percentage"):
              return { column: column, value: this.getPercentageAndDuration(row[column]) };
          }
        });
      })
      .enter()
      .append('td')
      .text((d) => d.value);

    // highlight rows 
    rows.filter((d, i) => d.Percentage == 0).style('background-color', 'lightpink');
    rows.filter((d, i) => d.Phase == longestPhase).style('background-color', 'lightgreen');

    // add footer
    var legend = select(`#table-legend-${this.videoMetadata.name}`);  // use table caption as footer
    var div1 = legend.append('div');
    var div2 = legend.append('div');

    div1.append('span')
      .style('display', 'inline-block')
      .style('height', '.7rem')
      .style('width', '.7rem')
      .style('margin-right', '.5rem')
      .style('background-color', 'lightgreen');

    div1.append('span').text('Longest phase');

    div2.append('span')
      .style('display', 'inline-block')
      .style('height', '.7rem')
      .style('width', '.7rem')
      .style('margin-right', '.5rem')
      .style('background-color', 'lightpink');

    div2.append('span').text('Missing phase');
  }

  private groupByPhase() {
    return nest().key(d => d.phase)
      .sortKeys((a, b) => parseInt(a) - parseInt(b))
      .rollup(leaves => leaves.length)
      .entries(this.phaseAnnotation)
      .map((row) => {  // create object with custom attributes to avoid mapping
        return {
          Phase: parseInt(row.key),
          Percentage: row.value
        }
      })
  }

  private getPercentageAndDuration(totalFrames: number) {
    var percent = (totalFrames / this.videoMetadata.numFrames * 100).toFixed(2);
    var dateObj = new Date(Math.floor(totalFrames / this.videoMetadata.fps) * 1000);
    var duration = `${('0' + dateObj.getUTCHours()).slice(-2)}:${('0' + dateObj.getUTCMinutes()).slice(-2)}:${('0' + dateObj.getUTCSeconds()).slice(-2)}`;
    return `${percent}% (${duration})`;
  }

  private addMissingPhases(data) {
    var allPhases = range(14);  // 14 phases in total [0..13], according to documentation
    var actualPhases = data.map((d) => d.Phase);
    var missingPhases = allPhases.filter(value => !actualPhases.includes(value));
    missingPhases.forEach(phase => {
      data.push({ Phase: phase, Percentage: 0 })
    });
    return data;
  }


}
