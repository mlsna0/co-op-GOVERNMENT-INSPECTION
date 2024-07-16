import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThaiApiAddressService {
  private baseUrl ="https://thaiaddressapi-thaikub.herokuapp.com/"; 
  /*คำขอที่จะรองรับได้ แค่ 60 คน 
  แหล่ง https://www.thaikub.com/apis/thai-address#thailand-district */

  constructor(private http: HttpClient) {

   }
  getProvinces(): Observable<any> {
    return this.http.get(`${this.baseUrl}v1/thailand/provinces`);
  }

  getDistricts(provinceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}v1/thailand/provinces/district?provinceId=${provinceId}`);
  }

  getSubDistricts(districtId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}v1/thailand/provinces/:provincename?districtId=${districtId}`);
  }
}
