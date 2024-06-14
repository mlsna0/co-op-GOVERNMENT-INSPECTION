import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GeocodingServiceService {

  constructor(
    private http:HttpClient
  ) { }

  getLocationName(lat: number, lng: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    return this.http.get<any>(url);
  }
}
