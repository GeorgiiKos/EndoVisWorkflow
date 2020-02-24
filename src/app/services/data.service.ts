
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  public getVideoMetadata() {
    const url = '/data/Frames/VideoMetadata.csv'
    return this.http.get(url, { responseType: "text" });
  }

  public getPhaseAnnotation(name: string) {
    const url = `/data/PhaseAnnotation/${name}.csv`
    return this.http.get(url, { responseType: "text" });
  }

  public getDeviceData(name: string) {
    const url = `/data/DeviceData/${name}_Device.csv`
    return this.http.get(url, { responseType: "text" });
  }

  public getInstrumentAnnotation(name: string) {
    const url = `/data/InstrumentAnnotation/${name}.csv`
    return this.http.get(url, { responseType: "text" });
  }
}
