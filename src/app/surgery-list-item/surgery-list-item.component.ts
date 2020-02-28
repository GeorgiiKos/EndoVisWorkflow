import { Component, Input, OnInit, ChangeDetectionStrategy, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { autoType, csvParse, csvParseRows } from 'd3';
import { DataService } from '../services/data.service';


@Component({
  selector: 'app-surgery-list-item',
  templateUrl: './surgery-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./surgery-list-item.component.css']
})
export class SurgeryListItemComponent implements OnInit {

  public cardExpanded = false;

  @Input() videoMetadata;
  public duration: string;
  public phaseAnnotation;
  public deviceData;
  public instrumentAnnotation;

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngOnChange() {
    console.log('change')

  }

  ngOnInit() {
    this.displayDuration();
    this.dataService.getPhaseAnnotation(this.videoMetadata.name)
      .subscribe(response => {
        this.phaseAnnotation = csvParseRows(response, (data, index) => {
          return {
            frame: parseInt(data[0]),
            phase: parseInt(data[1])
          }
        });
        this.cdr.markForCheck()
      })
  }

  private loadDeviceDataAndInstrumentAnnotation() {
    this.dataService.getDeviceData(this.videoMetadata.name).subscribe(response => {
      this.deviceData = csvParseRows(response, (data, index) => {
        return {
          frame: parseInt(data[0]),
          currentGasFlowRate: parseInt(data[1]),
          targetGasFlowRate: parseInt(data[2]),
          currentGasPressure: parseInt(data[3]),
          targetGasPressure: parseInt(data[4]),
          usedGasVolume: parseInt(data[5]),
          gasSupplyPressure: parseInt(data[6]),
          deviceOn: parseInt(data[7]),
          allLightsOff: parseInt(data[8]),
          intensityLight1: parseInt(data[9]),
          intensityLight2: parseInt(data[10]),
          intensity: parseInt(data[11]),
          whiteBalance: parseInt(data[12]),
          gains: parseInt(data[13]),
          exposureIndex: parseInt(data[14])
        }
      });
      this.cdr.markForCheck()
    })

    this.dataService.getInstrumentAnnotation(this.videoMetadata.name).subscribe(response => {
      this.instrumentAnnotation = csvParse(response, autoType)
      this.cdr.markForCheck()
    })

  }

  private displayDuration() {
    var dateObj = new Date(this.videoMetadata.duration);
    var hours = ('0' + dateObj.getUTCHours()).slice(-2);
    var minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
    var seconds = ('0' + dateObj.getUTCSeconds()).slice(-2)
    this.duration = `${hours}:${minutes}:${seconds}`;
  }

  public expandCard() {
    if (!this.deviceData && !this.instrumentAnnotation) {  // first click
      this.cardExpanded = true;
      this.loadDeviceDataAndInstrumentAnnotation();
    } else if (!this.cardExpanded) {
      this.cardExpanded = true;
    } else {
      this.cardExpanded = false;
    }
  }

}
