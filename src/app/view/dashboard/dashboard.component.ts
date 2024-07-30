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
  //  provinces: { id: number, name_th: string, selected: boolean }[] = []; // เปลี่ยนเป็น provinces
  provinces:any[] = []; 

  selectedProvince: string;
  recordCount:number
  isFilterActive: boolean = false;
  filteredProvinces: any[] = [];
  searchTerm: string = '';
  selectedProvinces: Set<number> = new Set<number>();

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
  
    // this.sv.buttonCount$.subscribe(count => {
    //   this.buttonCount = count;
    //   console.log('Received count:', count); // Debugging
    // });
  }

  // loadProvinces(): void {
  //   this.provinceService.getProvinces().subscribe(
  //     (data) => {
  //       console.log("Data from API:", data);
  //       this.provinces = data.map((province) => ({ name: province.name_th }));
  //       console.log("Provinces:", this.provinces);
  //     },
  //     (error) => {
  //       console.error("Error fetching provinces:", error);
  //     }
  //   );
  // }



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

  DetailFilterShow(){
    this.isFilterActive = !this.isFilterActive;
  }
  loadProvinces(): void {
    this.provinceService.getProvinces().subscribe(
      (data) => {
        // console.log("Data from API:", data);
        this.provinces = data.map((province) => ({
          id: province.id,
          name_th: province.name_th,
          selected: false
        }));
        this.filteredProvinces = [...this.provinces];
        console.log("Provinces:", this.provinces);
      },
      (error) => {
        console.error("Error fetching provinces:", error);
      }
    );
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.searchTerm = searchTerm; // อัปเดต searchTerm
    this.filteredProvinces = this.provinces.filter(province =>
      province.name_th.toLowerCase().includes(searchTerm)
    );
  }
  onSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.filteredProvinces.forEach(province => {
      province.selected = isChecked;
      if (isChecked) {
        this.selectedProvinces.add(province.id);
      } else {
        this.selectedProvinces.delete(province.id);
      }
    });
  }
  applyFilter() {
    const selectedProvincesArray = Array.from(this.selectedProvinces);
    console.log('Selected Provinces:', selectedProvincesArray);
    // Implement the logic to filter the data based on selected provinces
  }
  clearFilter() {
    // Clear the selected provinces
    this.selectedProvinces.clear();

    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('.province-checklist input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = false;
    });

    // Clear the search input
    (document.querySelector('.inputSearch') as HTMLInputElement).value = '';
    this.searchTerm = '';

    // Reset filtered provinces
    this.filteredProvinces.forEach(province => {
      province.selected = false;
    });
    this.loadProvinces();
  }
}
