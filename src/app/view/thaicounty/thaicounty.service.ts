import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {

  private provincesUrl = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json';
 
  private amphuresUrl = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/json/thai_amphures.json';
  private tambonsUrl = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/json/thai_tambons.json';
  
  constructor(private http: HttpClient) { }

  getProvinces(): Observable<any> {
    return this.http.get<any>(this.provincesUrl);
  }

  getProvincesWithDetails(): Observable<any> {
    return forkJoin({
      provinces: this.http.get<any>(this.provincesUrl), // Fetch provinces data
      amphures: this.http.get<any>(this.amphuresUrl),  // Fetch amphures data
      tambons: this.http.get<any>(this.tambonsUrl)     // Fetch tambons data
    }).pipe(
      map(({ provinces, amphures, tambons }) => {
        // Associate tambons with amphures based on amphure_id
        amphures.forEach(amphure => {
          amphure.tambons = tambons.filter(tambon => tambon.amphure_id === amphure.id);
        });
        // Associate amphures with provinces based on province_id
        provinces.forEach(province => {
          province.amphures = amphures.filter(amphure => amphure.province_id === province.id);
        });
        return provinces; // Return the combined data
      })
    );
  }
 
  getamphures(): Observable<any> {
    return this.http.get<any>(this.amphuresUrl);
  }

  gettambons(): Observable<any> {
    return this.http.get<any>(this.tambonsUrl);
  }
}
      