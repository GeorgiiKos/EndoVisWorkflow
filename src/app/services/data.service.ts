import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  public getSurgeryList(): Observable<String[]> {
    const url = 'http://localhost:8000/getSurgeryList'
    return this.http.get<String[]>(url);
  }

}
