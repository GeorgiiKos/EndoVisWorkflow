import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SurgeryPhases } from '../models/surgeryPhases';
import { Surgery } from '../models/surgery';

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

}
