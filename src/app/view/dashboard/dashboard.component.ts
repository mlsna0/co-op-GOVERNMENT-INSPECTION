  import { Component, OnInit,ViewChild,ViewChildren } from "@angular/core";
  import { ProvinceService } from "../thaicounty/thaicounty.service";
  import { SharedService } from "app/services/shared.service";
  import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
  import { subscribeOn,Subscription } from "rxjs";
  import { Chart, registerables } from 'chart.js';
  import { Router, NavigationEnd } from '@angular/router';
  import { MatSelect } from '@angular/material/select';


  @Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"],
  })
  export class DashboardComponent implements OnInit {
    //  provinces: { id: number, name_th: string, selected: boolean }[] = []; // เปลี่ยนเป็น provinces
    provinces:any[] = []; 
    recordCount:number;
    userCount:number;

    //filter
    isFilterActive: boolean = false;
    filteredProvinces: any[] = [];
    searchTerm: string = '';
    selectedProvinces: Set<number> = new Set<number>();
    isProvinceDropdownOpen: boolean = false;
    isDateDropdownOpen: boolean = false;
    startDate: string | null = null;
    endDate: string | null = null;
    selectedProvince: string;

    //chart
    chart: any;
    displayedProvinces: any[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 0;
    routerSubscription: Subscription;


    @ViewChild('provinceSelect') provinceSelect: MatSelect;
    constructor(
      private provinceService: ProvinceService,
      private sv:SharedService,
      private authService: AuthService,    
      private router: Router
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

      this.sv.getUserCount().subscribe(res=>{
        this.userCount = res;
        // console.log("user count: ",this.userCount)
      },
      error => {
        console.error(error);
      });

      // Create the chart
      this.routerSubscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url === '/dashboard') {
            this.createChart();
            // this.createDonutChart()
          } else {
            if (this.chart) {
              this.chart.destroy();
            }
          }
        }
      })
    
      // this.sv.buttonCount$.subscribe(count => {
      //   this.buttonCount = count;
      //   console.log('Received count:', count); // Debugging
      // });
    }

    ngAfterViewInit(): void {
      Chart.register(...registerables);
      this.createChart();
      // this.createDonutChart()
    }
    ngOnDestroy(): void {
      if (this.chart) {
        this.chart.destroy();
      }
      if (this.routerSubscription) {
        this.routerSubscription.unsubscribe();
      }
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

          this.totalPages = Math.ceil(this.provinces.length / this.itemsPerPage);
          this.updateDisplayedProvinces();
        },
        (error) => {
          console.error("Error fetching provinces:", error);
        }
      );
    }

    toggleDropdown(type: string): void {
      if (type === 'province') {
        this.isProvinceDropdownOpen = !this.isProvinceDropdownOpen;
        this.isDateDropdownOpen = false; // ปิด dropdown วันที่ เมื่อเปิด dropdown จังหวัด
      } else if (type === 'date') {
        this.isDateDropdownOpen = !this.isDateDropdownOpen;
        this.isProvinceDropdownOpen = false; // ปิด dropdown จังหวัด เมื่อเปิด dropdown วันที่
      }
    }
    openDatePicker(): void {
      this.toggleDropdown('date');
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
    onProvinceSelect(event: any) {
      const isChecked = event.target.checked;
      const provinceId = Number(event.target.value);
      const province = this.provinces.find(p => p.id === provinceId);
  
      if (province) {
        province.selected = isChecked;
        if (isChecked) {
          this.selectedProvinces.add(provinceId);
        } else {
          this.selectedProvinces.delete(provinceId);
        }
      }
    }
    applyFilter() {
      const selectedProvincesArray = Array.from(this.selectedProvinces);
      console.log('Selected Provinces:', selectedProvincesArray);
      this.updateDisplayedProvinces(); 
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

    //date filter
    onDateChange(): void {
      // ฟังก์ชันเปลี่ยนวันที่
      console.log('Start Date:', this.startDate);
      console.log('End Date:', this.endDate);
    }



    //chart
    updateDisplayedProvinces(): void {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.displayedProvinces = this.provinces.slice(start, end);
      if (this.chart) {
        this.chart.destroy();
        this.createChart();
      }
    }
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updateDisplayedProvinces();
      }
    }
  
    prevPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateDisplayedProvinces();
      }
    }
    createChart(): void {
      const canvas = document.getElementById('myLineChart') as HTMLCanvasElement | null;
    
      if (!canvas) {
        console.error('Canvas element with ID "myLineChart" not found');
        return;
      }
    
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      if (this.chart) {
        this.chart.destroy();
      }
      const provinceLabels = this.filteredProvinces
    .filter(province => province.selected)
    .map(province => province.name_th);
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: provinceLabels,
          datasets: [
            {
              label: 'เอกสารที่ถูกสร้าง',
              data: [65, 59, 80, 81, 56, 55, 40,80, 81, 56].slice(0, this.displayedProvinces.length),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1
            },
            {
              label: 'ผู้ใข้งาน',
              data: [65, 48, 40, 19, 86, 27, 90,48, 40, 19].slice(0, this.displayedProvinces.length),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: false // เปลี่ยนเป็น false เพื่อแสดงแท่งข้างกัน
            },
            y: {
              stacked: false,
              beginAtZero: true
            }
          }
        }
      });
    }
    
    // createDonutChart(): void {
    //   const canvas = document.getElementById('signedDocumentsChart') as HTMLCanvasElement | null;
  
    //   if (!canvas) {
    //     console.error('Canvas element with ID "signedDocumentsChart" not found');
    //     return;
    //   }
  
    //   const ctx = canvas.getContext('2d');
    //   if (!ctx) {
    //     console.error('Failed to get canvas context');
    //     return;
    //   }
  
    //   this.chart = new Chart(ctx, {
    //     type: 'doughnut',
    //     data: {
    //       labels: ['Signed Documents', 'Unsigned Documents'],
    //       datasets: [{
    //         label: 'Documents',
    //         data: [13025, 5025], // เปลี่ยนข้อมูลตามจริง
    //         backgroundColor: [
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(255, 99, 132, 0.2)'
    //         ],
    //         borderColor: [
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(255, 99, 132, 1)'
    //         ],
    //         borderWidth: 1
    //       }]
    //     },
    //     options: {
    //       responsive: true,
    //       maintainAspectRatio: false
    //     }
    //   });
    // }
    
    // createChart(): void {
    //   const canvas = document.getElementById('myLineChart') as HTMLCanvasElement | null;
  
    //   if (!canvas) {
    //     console.error('Canvas element with ID "myLineChart" not found');
    //     return;
    //   }
  
    //   const ctx = canvas.getContext('2d');
    //   if (!ctx) {
    //     console.error('Failed to get canvas context');
    //     return;
    //   }
  
      
    //   this.chart = new Chart(ctx, {
    //     type: 'bar',
    //     data: {
    //       labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //       datasets: [{
    //         label: 'My First Dataset',
    //         data: [65, 59, 80, 81, 56, 55, 40],
    //         backgroundColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(255, 159, 64, 0.2)',
    //           'rgba(255, 205, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(201, 203, 207, 0.2)'
    //         ],
    //         borderColor: [
    //           'rgb(255, 99, 132)',
    //           'rgb(255, 159, 64)',
    //           'rgb(255, 205, 86)',
    //           'rgb(75, 192, 192)',
    //           'rgb(54, 162, 235)',
    //           'rgb(153, 102, 255)',
    //           'rgb(201, 203, 207)'
    //         ],
    //         borderWidth: 1
    //       }]
    //     },
    //     options: {
    //       scales: {
    //         y: {
    //           beginAtZero: true
    //         }
    //       }
    //     }
    //   });
    // }
  }
