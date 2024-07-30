import { Component, OnInit } from "@angular/core";
import { ProvinceService } from "../thaicounty/thaicounty.service";
import { SharedService } from "app/services/shared.service";
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { subscribeOn } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  provinces: { name: string }[] = []; // เปลี่ยนเป็น provinces
  selectedProvince: string;
  // provinces: any[] = [];
  recordCount:number
  buttonCount: number = 0;
  constructor(
    private provinceService: ProvinceService,
    private sv:SharedService,
    private authService: AuthService
  ) {}
  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get isSuperAdmin(): boolean {
    const isSuperAdmin = this.authService.hasRole('superadmin');
    console.log('isSuperAdmin:', isSuperAdmin); // ตรวจสอบค่า
    return isSuperAdmin;
  }

  get isTwoRole(): boolean {
    return this.isAdmin || this.isUser;
  }

  get isUser(): boolean {
    return this.authService.hasRole('user');
  }
  ngOnInit(): void {
    this.loadProvinces();

    this.sv.getRecordCount().subscribe(
      count => {
        this.recordCount = count;
      },
      error => {
        console.error(error);
      }
    );
  
    this.sv.buttonCount$.subscribe(count => {
      this.buttonCount = count;
      console.log('Received count:', count); // Debugging
    });
  }

  loadProvinces(): void {
    this.provinceService.getProvinces().subscribe(
      (data) => {
        console.log("Data from API:", data);
        this.provinces = data.map((province) => ({ name: province.name_th }));
        console.log("Provinces:", this.provinces);
      },
      (error) => {
        console.error("Error fetching provinces:", error);
      }
    );
  }

  onProvinceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProvince = target.value;

    // ตรวจสอบการเลือก "เลือกทั้งหมด"
    if (this.selectedProvince === "") {
      console.log("เลือกทั้งหมด");
    } else {
      const selectedProvinceData = this.provinces.find(
        (province) => province.name === this.selectedProvince
      );
      console.log("Selected Province:", selectedProvinceData);
    }
  }

  // getDataCount() {
  //   this.sv.getData().subscribe(data => {
  //     console.log('Data received from API:', data);
  //     if (data && data.records && data.records.length > 0) {
  //       // ใช้ record_id จาก data.records แทน
  //       const ids = data.records.map(item => Number(item.record_id));
  //       console.log('Record IDs from data:', ids);
  //       // this.lastDataId = Math.max(...ids);
  //     } else {
  //       console.warn('No data received or records are empty');
  //     }
  //     // console.log('Last Data ID:', this.lastDataId);
  //     // this.cdr.detectChanges(); // Trigger change detection
  //   }, error => {
  //     console.error('Error fetching data count:', error);
  //   });
  // }

  // getDifference(): number {
  //   return this.lastDataId - this.pdfButtonCount;
  // }
}
