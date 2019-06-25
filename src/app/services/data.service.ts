import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { DeviceData } from '../models/deviceData';
import { DeviceDataUnit } from '../models/deviceDataUnit';
import { Phase } from '../models/phase';
import { Surgery } from '../models/surgery';
import { SurgeryPhases } from '../models/surgeryPhases';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  public getSurgeryList(): Observable<Surgery[]> {
    const url = 'http://localhost:4200/api/getSurgeryList'
    return this.http.get<Surgery[]>(url);
  }

  public getPhasesArray(surgeryName: String): Observable<SurgeryPhases> {
    const url = `http://localhost:4200/api/getPhasesArray?surgeryName=${surgeryName}`
    return this.http.get(url, { responseType: "text" })
      .map(response => {
        var data = response
          .toString() // convert Buffer to string
          .trim()
          .split('\n') // split string to lines
          .map(e => e.trim()) // remove white spaces for each line
          .map(e => e.split(',').map(e => e.trim()))
          .map(e => new Phase(e[0], e[1]));
        return new SurgeryPhases(surgeryName, data)
      });
  }

  public getDeviceArray(surgeryName: String): Observable<DeviceData> {
    const url = `http://localhost:4200/api/getDeviceArray?surgeryName=${surgeryName}`
    return this.http.get(url, { responseType: "text" })
      .map(response => {
        var data = response
          .toString() // convert Buffer to string
          .trim()
          .split('\n') // split string to lines
          .map(e => e.trim()) // remove white spaces for each line
          .map(e => e.split(',').map(e => e.trim()))
          .map(e => new DeviceDataUnit(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14]))

        return new DeviceData(surgeryName, data);
      })
  }
}
