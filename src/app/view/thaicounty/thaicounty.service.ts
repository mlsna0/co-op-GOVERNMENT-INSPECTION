import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {

  private apiUrl = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json'; // or use the other API URL

  constructor(private http: HttpClient) { }

  getProvinces(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
    