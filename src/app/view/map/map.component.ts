import { Component, AfterViewInit } from '@angular/core';
import { loginservice } from "app/layouts/login.services.";
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map: L.Map;

  private provinceCoordinates = {
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Chiang Mai': { lat: 18.7883, lng: 98.9853 },
    'Phuket': { lat: 7.8804, lng: 98.3923 },
    'Khon Kaen': { lat: 16.4419, lng: 102.8359 },
    'Nakhon Ratchasima': { lat: 14.9799, lng: 102.0977 },
    'Ayutthaya': { lat: 14.3532, lng: 100.5684 },
    'Chon Buri': { lat: 13.3611, lng: 100.9847 },
    'Chiang Rai': { lat: 19.9104, lng: 99.8406 },
    'Nakhon Si Thammarat': { lat: 8.4324, lng: 99.9631 },
    'Songkhla': { lat: 7.1988, lng: 100.5954 },
    'Lopburi': { lat: 14.7994, lng: 100.648 },
    'Sukhothai': { lat: 17.0026, lng: 99.8218 },
    'Kanchanaburi': { lat: 14.0244, lng: 99.5331 },
    'Trat': { lat: 12.2397, lng: 102.5157 },
    'Udon Thani': { lat: 17.4156, lng: 102.7859 },
    'Ubon Ratchathani': { lat: 15.249, lng: 104.8557 },
    'Pattani': { lat: 6.8754, lng: 101.2958 },
    'Roi Et': { lat: 16.0801, lng: 103.6515 },
    'Surat Thani': { lat: 9.1391, lng: 99.3214 },
    'Phetchaburi': { lat: 12.9606, lng: 99.9555 },
    'Nakhon Pathom': { lat: 13.8216, lng: 100.0311 },
    'Chai Nat': { lat: 15.1854, lng: 100.125 },
    'Lampang': { lat: 18.2912, lng: 99.5072 },
    'Prachuap Khiri Khan': { lat: 11.7854, lng: 99.79 },
    'Mae Hong Son': { lat: 19.3036, lng: 97.963 },
    'Nakhon Nayok': { lat: 14.1985, lng: 101.2112 },
    'Prachin Buri': { lat: 14.0577, lng: 101.3884 },
    'Sisaket': { lat: 15.1142, lng: 104.328 },
    'Yasothon': { lat: 15.7735, lng: 104.339 },
    'Phitsanulok': { lat: 16.8258, lng: 100.2637 },
    'Phrae': { lat: 18.1511, lng: 100.1645 },
    'Saraburi': { lat: 14.5324, lng: 100.8037 },
    'Samut Prakan': { lat: 13.5964, lng: 100.6018 },
    'Samut Songkhram': { lat: 13.4113, lng: 99.974 },
    'Suphan Buri': { lat: 14.4709, lng: 100.125 },
    'Phatthalung': { lat: 7.6165, lng: 100.0554 },
    'Buri Ram': { lat: 15.0215, lng: 103.1233 },
    'Chaiyaphum': { lat: 15.7956, lng: 102.0283 },
    'Rayong': { lat: 12.6825, lng: 101.2754 },
    'Nakhon Sawan': { lat: 15.7088, lng: 100.1372 },
    'Sakon Nakhon': { lat: 17.1673, lng: 104.1492 },
    'Mukdahan': { lat: 16.5453, lng: 104.7239 },
    'Nan': { lat: 18.7824, lng: 100.7811 },
    'Nonthaburi': { lat: 13.8591, lng: 100.5217 },
    'Sa Kaeo': { lat: 13.814, lng: 102.0721 },
    'Chachoengsao': { lat: 13.6904, lng: 101.0772 },
    'Phetchabun': { lat: 16.4201, lng: 101.1606 },
    'Amnat Charoen': { lat: 15.8582, lng: 104.627 },
    'Chanthaburi': { lat: 12.6113, lng: 102.1041 },
    'Nong Bua Lamphu': { lat: 17.2046, lng: 102.4407 },
    'Nong Khai': { lat: 17.8783, lng: 102.7427 },
    'Satun': { lat: 6.6238, lng: 100.0674 },
    'Narathiwat': { lat: 6.4264, lng: 101.8239 },
    'Yala': { lat: 6.5421, lng: 101.28 },
    'Ranong': { lat: 9.9659, lng: 98.6348 },
    'Tak': { lat: 16.8836, lng: 99.1255 },
    'Phang Nga': { lat: 8.451, lng: 98.522 },
    'Krabi': { lat: 8.0863, lng: 98.9063 },
    'Kalasin': { lat: 16.4322, lng: 103.5061 },
    'Nakhon Phanom': { lat: 17.3998, lng: 104.7922 },
    'Lamphun': { lat: 18.574, lng: 99.0087 },
    'Phayao': { lat: 19.1938, lng: 99.878 },
    'Ratchaburi': { lat: 13.5362, lng: 99.8111 },
    'Phichit': { lat: 16.4477, lng: 100.3496 },
    'Ang Thong': { lat: 14.5896, lng: 100.4553 },
    'Chumphon': { lat: 10.493, lng: 99.1801 },
    'Surin': { lat: 14.8818, lng: 103.4936 },
    'Uttaradit': { lat: 17.6254, lng: 100.0993 },
    'Trang': { lat: 7.5564, lng: 99.6114 },
    'Sing Buri': { lat: 14.8921, lng: 100.4011 },
    'Maha Sarakham': { lat: 16.1861, lng: 103.2987 },
    'Samut Sakhon': { lat: 13.5476, lng: 100.2736 },
    'Bueng Kan': { lat: 18.3608, lng: 103.6496 },
    'Kamphaeng Phet':{ lat: 16.4828, lng: 99.5217 },
    'Uthai Thani':  { lat: 15.3644, lng: 100.0269 },
    'Pathum Thani': { lat: 14.0208, lng: 100.525 },
    'Loei': { lat: 17.486, lng: 101.7223 }
 
    // คุณสามารถเพิ่มข้อมูลจังหวัดและพิกัดอื่น ๆ ได้ที่นี่ตามต้องการ
  }

  constructor(private loginservice: loginservice,private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.initMap();

    this.loginservice.getUserReport().subscribe(report => {
      console.log('Report:', report); // ดูโครงสร้างของ report
  
      const provinceId = report.employee ? report.employee.province : undefined;
      
      if (provinceId !== undefined) {
          console.log('User province ID:', provinceId);
  
          this.getProvinceNameFromApi(provinceId).subscribe(provinceName => {
              console.log('User province name:', provinceName);
              const coordinates = this.provinceCoordinates[provinceName];
  
              if (coordinates) {
                  this.addMarker(coordinates.lat, coordinates.lng);
              } else {
                  console.error('Province not found:', provinceName);
              }
          });
      } else {
          console.error('Province ID is undefined');
      }
  });
  
}

  private initMap(): void {
    this.map = L.map('map').setView([13.7563, 100.5018], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  private addMarker(lat: number, lng: number): void {
    L.marker([lat, lng]).addTo(this.map)
      .bindPopup('คุณอยู่ที่นี่!')
      .openPopup();
  }

  private getProvinceNameFromApi(provinceId: number): Observable<string> {
    const apiUrl = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json';
    return this.http.get<any[]>(apiUrl).pipe(
        map(provinces => {
            console.log('Fetched provinces:', provinces);  // เพิ่มบรรทัดนี้
            const province = provinces.find(p => p.id === provinceId);
            console.log('Matched province:', province);  // เพิ่มบรรทัดนี้
            return province ? province.name_th : 'Unknown Province';
        }),
        catchError(error => {
            console.error('Error fetching province name:', error);
            return throwError('Error fetching province name');
        })
    );
  }
}
