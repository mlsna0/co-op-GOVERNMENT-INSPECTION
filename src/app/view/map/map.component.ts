import { Component, AfterViewInit,Input,SimpleChanges } from '@angular/core';
import { loginservice } from "app/layouts/login.services.";
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { ProvinceService } from '../thaicounty/thaicounty.service';
import { SharedService } from "../../services/shared.service";
import { BehaviorSubject, Subject } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  user: any = {};
  provinces: any[] = [];
  @Input() filterCriteria: any;
  selectedProvinceName: any;  // เก็บชื่อจังหวัดที่เลือก
  private map: L.Map;
  loading: boolean = true;
  dtTrigger: BehaviorSubject<any> = new BehaviorSubject([]); 
  private provinceCoordinates = {
    'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
    'เชียงใหม่': { lat: 18.7883, lng: 98.9853 },
    'ภูเก็ต': { lat: 7.8804, lng: 98.3923 },
    'ขอนแก่น': { lat: 16.4419, lng: 102.8359 },
    'นครราชสีมา': { lat: 14.9799, lng: 102.0977 },
    'พระนครศรีอยุธยา': { lat: 14.3532, lng: 100.5684 },
    'ชลบุรี': { lat: 13.3611, lng: 100.9847 },
    'เชียงราย': { lat: 19.9104, lng: 99.8406 },
    'นครศรีธรรมราช': { lat: 8.4324, lng: 99.9631 },
    'สงขลา': { lat: 7.1988, lng: 100.5954 },
    'ลพบุรี': { lat: 14.7994, lng: 100.648 },
    'สุโขทัย': { lat: 17.0026, lng: 99.8218 },
    'กาญจนบุรี': { lat: 14.0244, lng: 99.5331 },
    'ตราด': { lat: 12.2397, lng: 102.5157 },
    'อุดรธานี': { lat: 17.4156, lng: 102.7859 },
    'อุบลราชธานี': { lat: 15.249, lng: 104.8557 },
    'ปัตตานี': { lat: 6.8754, lng: 101.2958 },
    'ร้อยเอ็ด': { lat: 16.0801, lng: 103.6515 },
    'สุราษฎร์ธานี': { lat: 9.1391, lng: 99.3214 },
    'เพชรบุรี': { lat: 12.9606, lng: 99.9555 },
    'นครปฐม': { lat: 13.8216, lng: 100.0311 },
    'ชัยนาท': { lat: 15.1854, lng: 100.125 },
    'ลำปาง': { lat: 18.2912, lng: 99.5072 },
    'ประจวบคีรีขันธ์': { lat: 11.7854, lng: 99.79 },
    'แม่ฮ่องสอน': { lat: 19.3036, lng: 97.963 },
    'นครนายก': { lat: 14.1985, lng: 101.2112 },
    'ปราจีนบุรี': { lat: 14.0577, lng: 101.3884 },
    'ศรีสะเกษ': { lat: 15.1142, lng: 104.328 },
    'ยโสธร': { lat: 15.7735, lng: 104.339 },
    'พิษณุโลก': { lat: 16.8258, lng: 100.2637 },
    'แพร่': { lat: 18.1511, lng: 100.1645 },
    'สระบุรี': { lat: 14.5324, lng: 100.8037 },
    'สมุทรปราการ': { lat: 13.5964, lng: 100.6018 },
    'สมุทรสงคราม': { lat: 13.4113, lng: 99.974 },
    'สุพรรณบุรี': { lat: 14.4709, lng: 100.125 },
    'พัทลุง': { lat: 7.6165, lng: 100.0554 },
    'บุรีรัมย์': { lat: 15.0215, lng: 103.1233 },
    'ชัยภูมิ': { lat: 15.7956, lng: 102.0283 },
    'ระยอง': { lat: 12.6825, lng: 101.2754 },
    'นครสวรรค์': { lat: 15.7088, lng: 100.1372 },
    'สกลนคร': { lat: 17.1673, lng: 104.1492 },
    'มุกดาหาร': { lat: 16.5453, lng: 104.7239 },
    'น่าน': { lat: 18.7824, lng: 100.7811 },
    'นนทบุรี': { lat: 13.8591, lng: 100.5217 },
    'สระแก้ว': { lat: 13.814, lng: 102.0721 },
    'ฉะเชิงเทรา': { lat: 13.6904, lng: 101.0772 },
    'เพชรบูรณ์': { lat: 16.4201, lng: 101.1606 },
    'อำนาจเจริญ': { lat: 15.8582, lng: 104.627 },
    'จันทบุรี': { lat: 12.6113, lng: 102.1041 },
    'หนองบัวลำภู': { lat: 17.2046, lng: 102.4407 },
    'หนองคาย': { lat: 17.8783, lng: 102.7427 },
    'สตูล': { lat: 6.6238, lng: 100.0674 },
    'นราธิวาส': { lat: 6.4264, lng: 101.8239 },
    'ยะลา': { lat: 6.5421, lng: 101.28 },
    'ระนอง': { lat: 9.9659, lng: 98.6348 },
    'ตาก': { lat: 16.8836, lng: 99.1255 },
    'พังงา': { lat: 8.451, lng: 98.522 },
    'กระบี่': { lat: 8.0863, lng: 98.9063 },
    'กาฬสินธุ์': { lat: 16.4322, lng: 103.5061 },
    'นครพนม': { lat: 17.3998, lng: 104.7922 },
    'ลำพูน': { lat: 18.574, lng: 99.0087 },
    'พะเยา': { lat: 19.1938, lng: 99.878 },
    'ราชบุรี': { lat: 13.5362, lng: 99.8111 },
    'พิจิตร': { lat: 16.4477, lng: 100.3496 },
    'อ่างทอง': { lat: 14.5896, lng: 100.4553 },
    'ชุมพร': { lat: 10.493, lng: 99.1801 },
    'สุรินทร์': { lat: 14.8818, lng: 103.4936 },
    'อุตรดิตถ์': { lat: 17.6254, lng: 100.0993 },
    'ตรัง': { lat: 7.5564, lng: 99.6114 },
    'สิงห์บุรี': { lat: 14.8921, lng: 100.4011 },
    'มหาสารคาม': { lat: 16.1861, lng: 103.2987 },
    'สมุทรสาคร': { lat: 13.5476, lng: 100.2736 },
    'บึงกาฬ': { lat: 18.3608, lng: 103.6496 },
    'กำแพงเพชร': { lat: 16.4828, lng: 99.5217 },
    'อุทัยธานี':  { lat: 15.3644, lng: 100.0269 },
    'ปทุมธานี': { lat: 14.0208, lng: 100.525 },
    'เลย': { lat: 17.4913, lng: 101.7223 },
  };

  constructor(
    private loginservice: loginservice, 
    private http: HttpClient, 
    private provinceService: ProvinceService,
    private sv:SharedService) { }

    ngAfterViewInit(): void {

      this.provinceService.getProvinces().subscribe(data => {
     
        this.provinces = data; // เก็บข้อมูลจังหวัดทั้งหมดใน component
        this.loadUserReport();
        this.loading = false;
        this.dtTrigger.next(this.provinces);
      });
      this.initMap();
      // this.loadUserReport();
    }
    ngOnChanges(changes: SimpleChanges) {
      if (changes['filterCriteria']) {
        // console.log('FilterCriteria changed: ', changes['filterCriteria'].currentValue);
        if (this.filterCriteria) {
          this.applyFilter();
        }
      }
    }
    applyFilter() {
      if (this.filterCriteria) {
        // console.log('Applying filter with criteria: ', this.filterCriteria);
        // โค้ดการกรองข้อมูลตาม this.filterCriteria
        this.filterProvinces();
      }
    }
    filterProvinces() {
      if (this.filterCriteria && this.filterCriteria.selectedProvinces) {
        const selectedIds = this.filterCriteria.selectedProvinces; // Get selected province IDs
    
        this.provinces = this.provinces.filter(province =>
          selectedIds.includes(province.id) // Check if province ID is in selected IDs
          
        );
        // console.log('Filtered Provinces:', this.provinces);
    
        // Update DataTable with filtered data
        this.dtTrigger.next(this.provinces);
        // $(document).ready(() => {
        //   const table = $('#yourDataTableId').DataTable(); // Update this with your table ID
        //   table.clear(); // Clear existing data
        //   table.rows.add(this.provinces); // Add new data
        //   table.draw(); // Redraw the table
        // });
      }
    }
    ngOnDestroy(): void {
      this.dtTrigger.unsubscribe();
    }
    private initMap(): void {
      this.map = L.map('map').setView([13.7563, 100.5018], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
      }).addTo(this.map);
    }
  
    private addMarker(lat: number, lng: number, topics: string[], places: string[], locations: string[]): void {
      const customIcon = new L.Icon({
        iconUrl: 'assets/img/icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 31],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
  
      let popupContent = `<div>`;
      topics.forEach((topic, index) => {
        popupContent += `
          <strong>Topic ${index + 1}:</strong> ${topic || 'No topic available'}<br>
          <strong>Place ${index + 1}:</strong> ${places[index] || 'No places available'}<br>
          <strong>Location ${index + 1}:</strong> ${locations[index] || 'No location available'}<br><br>
        `;
      });
      popupContent += `</div>`;
  
      L.marker([lat, lng], { icon: customIcon }).addTo(this.map)
        .bindPopup(popupContent)
        
    }
  
    loadUserReport(): void {
      this.loginservice.getUserProfile().subscribe(
        (user) => {
          // console.log('User Profile:', user); // ตรวจสอบข้อมูล user profile ที่ได้มา
          if (user && user._id) {
            const userRole = user.role;
            // console.log('User Role:', userRole); // ตรวจสอบบทบาทของผู้ใช้
    
            this.sv.getallRecordWithUserAndEmployee().subscribe(
              (data) => {
                // console.log('All Records Data:', data); // ตรวจสอบข้อมูล records ทั้งหมดที่ได้มา
                const documents = data;
                this.processData(documents, userRole, user); // ส่ง user ไปด้วย
              },
              (error) => {
                console.error(`Error loading data for ${userRole}:`, error);
              }
            );
          } else {
            console.error('User ID is undefined or null.');
          }
        },
        (error) => {
          console.error('Error fetching user profile:', error);
        }
      );
    }
    
    
    // ฟังก์ชันประมวลผลข้อมูล ใช้ร่วมกันได้ทั้ง superadmin และ admin
    processData(documents: any[], role: string, user: any): void {
      // console.log('Processing data for role:', role); // ตรวจสอบบทบาทของผู้ใช้
      if (role === 'superadmin') {
        // console.log('Processing as superadmin'); // Log เมื่อประมวลผลในฐานะ superadmin
        this.processSuperAdminData(documents);
      } else if (role === 'admin') {
        const userEmployee = user.employeeId;
        const userOrganization = userEmployee ? userEmployee.organization : undefined;
    
        // console.log('User Employee:', userEmployee); // ตรวจสอบข้อมูล employee
        // console.log('User Organization:', userOrganization); // ตรวจสอบ organization
    
        if (userOrganization) {
          const filteredDocuments = documents.filter((doc) => {
            return doc.employee.organization === userOrganization;
          });
    
          // console.log(`User's Organization: ${userOrganization}`); // Log ข้อมูลบริษัทที่ตรงกับผู้ใช้
          // // console.log('Filtered Documents:', filteredDocuments); // Log ข้อมูลเอกสารที่กรองแล้ว
    
          this.processAdminData(filteredDocuments);
        } else {
          console.error('User organization is undefined.');
        }
      }
    }
    
    
    processAdminData(filteredData: any): void {
      const locationMap: any = {};
    
      // วนลูปข้อมูลที่ผ่านการกรอง ซึ่งประกอบด้วยข้อมูลพนักงานและเอกสาร
      filteredData.forEach((recordGroup: any) => {
        const documents = recordGroup.documents; // เข้าถึงอาร์เรย์ documents ของแต่ละ group
    
        documents.forEach((record: any) => {
          const topic = record.record_topic || 'No topic available';
          const place = record.record_place || 'No places available';
          let location = record.record_location || 'No location available';
    
          if (location && location !== 'No location available') {
            location = location.trim();
    
            // ตรวจสอบว่าค่าของ location ตรงตามรูปแบบ "Lat: xx, Lng: xx"
            const locationPattern = /^Lat:\s*(-?\d+(\.\d+)?),\s*Lng:\s*(-?\d+(\.\d+)?)$/;
            if (locationPattern.test(location)) {
              const latLngString = location.replace("Lat:", "").replace("Lng:", "").split(',');
              const lat = parseFloat(latLngString[0].trim());
              const lng = parseFloat(latLngString[1].trim());
              const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;  // ใช้ 4 หลักทศนิยม
    
              if (!isNaN(lat) && !isNaN(lng)) {
                if (!locationMap[key]) {
                  locationMap[key] = { lat, lng, topics: [], places: [], locations: [] };
                }
                locationMap[key].topics.push(topic);
                locationMap[key].places.push(place);
                locationMap[key].locations.push(location); // เก็บข้อมูล location
              } else {
                console.error('Invalid lat/lng values:', latLngString);
              }
            } else {
              console.error('Location does not match the expected pattern:', location);
            }
          } else {
            console.warn('No location data available for this record.');
          }
        });
      });
    
      // วน loop เพื่อนำข้อมูลใน locationMap ไปแสดง marker
      for (const key in locationMap) {
        if (locationMap.hasOwnProperty(key)) {
          const loc = locationMap[key];
          // เพิ่ม marker ในตำแหน่งที่ถูกต้องด้วยข้อมูลหัวข้อ สถานที่ และพิกัด
          this.addMarker(loc.lat, loc.lng, loc.topics, loc.places, loc.locations);
        }
      }
    }
    processSuperAdminData(data: any[]): void {
      const dataByProvince: { [provinceName: string]: any[] } = {};
      console.log('SuperAdmin data:', data); // ตรวจสอบข้อมูลที่รับมา
    
      data.forEach(item => {
        const rawProvince = item.agency?.province; // แก้ไขจาก employee เป็น agency
        // console.log('Raw Province from agency:', rawProvince); // Log ข้อมูล province จาก agency
    
        if (!rawProvince) return;
    
        const provinceId = parseInt(rawProvince, 10);
        if (isNaN(provinceId)) return;
    
        const provinceName = this.provinceService.getProvinceNameById(provinceId, this.provinces);
        // console.log('Province Name:', provinceName); // ตรวจสอบชื่อจังหวัดที่ได้มา
    
        if (!provinceName) return;
    
        if (!dataByProvince[provinceName]) {
          dataByProvince[provinceName] = [];
        }
    
        dataByProvince[provinceName].push(item);
      });
    
      Object.keys(dataByProvince).forEach(provinceName => {
        const provinceData = dataByProvince[provinceName];
        if (!provinceData.length) return;
    
        const loc = this.provinceCoordinates[provinceName];
        if (loc) {
          const topics: string[] = [];
          const places: string[] = [];
          const locations: string[] = [];
    
          provinceData.forEach(item => {
            item.documents.forEach(doc => {
              topics.push(doc.record_topic || ''); // ถ้าไม่มีข้อมูลให้เว้นช่องว่าง
              places.push(doc.record_place || ''); // ถ้าไม่มีข้อมูลให้เว้นช่องว่าง
              locations.push(doc.record_location || ''); // ถ้าไม่มีข้อมูลให้เว้นช่องว่าง
            });
          });
    
          // console.log(`Adding marker at ${loc.lat}, ${loc.lng} for province ${provinceName}`); // Log การเพิ่ม marker
          // console.log('Topics:', topics);
          // console.log('Places:', places);
          // console.log('Locations:', locations);
    
          this.addMarker(loc.lat, loc.lng, topics, places, locations);
        } else {
          console.warn(`No coordinates found for province: ${provinceName}`);
        }
      });
    }
    
    
  
}
