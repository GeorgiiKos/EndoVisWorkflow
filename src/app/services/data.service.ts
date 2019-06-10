import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SurgeryPhases } from '../models/surgeryPhases';
import { Surgery } from '../models/surgery';
import { DeviceData } from '../models/DeviceData';
import { DeviceDataUnit } from '../models/deviceDataUnit';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  public getSurgeryList(): Observable<Surgery[]> {
    const url = 'http://localhost:4200/api/getSurgeryList'
    return this.http.get<Surgery[]>(url);
  }

  public getPhasesArray(surgeryName: String): Observable<SurgeryPhases> {
    const url = `http://localhost:4200/api/getPhasesArray?surgeryName=${surgeryName}`
    return this.http.get<SurgeryPhases>(url);
  }

  public getDeviceArray(surgeryName: String): Observable<DeviceData> {
    const url = `http://localhost:4200/api/getDeviceArray?surgeryName=${surgeryName}`
    return this.http.get<DeviceData>(url)
      .map(response => {
        var newDdu: DeviceDataUnit[]= [];
        response.data.forEach(element => {
          newDdu.push(new DeviceDataUnit(element[0], element[1],
            element[2],
            element[3],
            element[4],
            element[5],
            element[6],
            element[7],
            element[8],
            element[9],
            element[10],
            element[11],
            element[12],
            element[13],
            element[14]))
        });
        return new DeviceData(response.name, newDdu);
      })
  }
}
