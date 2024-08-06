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
  // ฟังก์ชันสำหรับรับชื่อจังหวัดจาก ID
  getProvinceNameById(provinceId: number, provinces: any[]): string {
    const province = provinces.find(p => p.id === provinceId);
    return province ? province.name_th : ''; // คืนชื่อจังหวัด หรือค่าว่าง
  }

  // ฟังก์ชันสำหรับรับชื่ออำเภอจาก ID
  getAmphureNameById(amphureId: number, amphures: any[]): string {
    const amphure = amphures.find(a => a.id === amphureId);
    return amphure ? amphure.name_th : ''; // คืนชื่ออำเภอ หรือค่าว่าง
  }

  // ฟังก์ชันสำหรับรับชื่อตำบลจาก ID
  getTambonNameById(tambonId: number, tambons: any[]): string {
    const tambon = tambons.find(t => t.id === tambonId);
    return tambon ? tambon.name_th : ''; // คืนชื่อตำบล หรือค่าว่าง
  }
}
      