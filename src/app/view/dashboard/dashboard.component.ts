  import { Component, OnInit,ViewChild,ViewChildren,HostListener,ElementRef } from "@angular/core";
  import { ProvinceService } from "../thaicounty/thaicounty.service";
  import { SharedService } from "app/services/shared.service";
  import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
  import { subscribeOn,Subscription } from "rxjs";
  import { Chart, registerables } from 'chart.js';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
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
    //การส่งข้อมูลไปยัง component อื่น เช่น <app-thaicounty></app-thaicounty>
    filterCriteria = null;

    @ViewChild('provinceSelect') provinceSelect: MatSelect;
    constructor(
      private provinceService: ProvinceService,
      private sv:SharedService,
      private authService: AuthService,    
      private router: Router,
      private  eRef: ElementRef
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
         
            this.createDonutChart();
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
      this.createDonutChart();
     
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


    // DetailFilterShow(){
    //   this.isFilterActive = !this.isFilterActive;
    // }
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
    @HostListener('document:click', ['$event'])
    closeDropdowns(event: Event): void {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.isProvinceDropdownOpen = false;
        // ปิด dropdown อื่นๆ ถ้ามี
      }
    }

    toggleDropdown(type: string,event : Event): void {

      if (type === 'province') {
        this.isProvinceDropdownOpen = !this.isProvinceDropdownOpen;
        this.isDateDropdownOpen = false; // ปิด dropdown วันที่ เมื่อเปิด dropdown จังหวัด
        event.stopPropagation();
      } else if (type === 'date') {
        this.isDateDropdownOpen = !this.isDateDropdownOpen;
        this.isProvinceDropdownOpen = false; // ปิด dropdown จังหวัด เมื่อเปิด dropdown วันที่
      }
    }
    openDatePicker(): void {
      this.toggleDropdown('date',event);
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
      console.log('Selected Provinces: ', selectedProvincesArray);
      this.filterCriteria = { selectedProvinces: selectedProvincesArray };
      this.isFilterActive = true;
      this.currentPage = 1; 
      this.isProvinceDropdownOpen = false;
      this.updateDisplayedProvinces(); 
      
    }
    clearFilter() {
      // Clear the selected provinces
      this.selectedProvinces.clear();

      // Uncheck all checkboxes
      const checkboxes = document.querySelectorAll(' .dropdown-scroller  input[type="checkbox"]'); //.province-checklist
      checkboxes.forEach(checkbox => {
        (checkbox as HTMLInputElement).checked = false;
      });

      // Clear the search input
      (document.querySelector('.inputSearch') as HTMLInputElement).value = '';
      this.searchTerm = '';

      // Reset filtered provinces
      this.filteredProvinces.forEach(province => {
        province.selected = false;
        this.isFilterActive =false;
      });
      // this.loadAllProvinces();
      this.loadProvinces();
      
    }

    //date filter
    onDateChange(): void {
      // ฟังก์ชันเปลี่ยนวันที่
      console.log('Start Date:', this.startDate);
      console.log('End Date:', this.endDate);
    }



    //chart
    loadAllProvinces(): void {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const dataToDisplay = this.isFilterActive ? this.filteredProvinces : this.provinces;
      this.displayedProvinces = dataToDisplay.slice(start, end);
      // console.log("next page Provinces length: ",this.displayedProvinces)
      if (this.chart) {
        this.chart.destroy();
      }
      this.createChart();
    }
    updateDisplayedProvinces(): void {
      const filteredProvinces = this.isFilterActive 
      ? this.filteredProvinces.filter(province => province.selected)
      : this.provinces

      const totalItems = filteredProvinces.length;
      this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = Math.min(start + this.itemsPerPage, totalItems);
  
      this.displayedProvinces = filteredProvinces.slice(start, end);


   
      if (this.chart) {
        this.chart.destroy();
        
      }
      this.createChart();
    }
    nextPage(): void {
 
      if (this.currentPage < this.totalPages && this.displayedProvinces.length >= this.itemsPerPage) {
        this.currentPage++;
        
        this.updateDisplayedProvinces();
        console.log("this.itemsPerPage: ",this.itemsPerPage)
        console.log("this.displayedProvinces.length: ",this.displayedProvinces.length)
        console.log("this.displayedProvinces: ",this.displayedProvinces)
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
      
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
    
      // กรองข้อมูลตามการกรองที่ใช้งานอยู่
      const filteredProvinces = this.isFilterActive
        ? this.filteredProvinces.filter(province => province.selected)
        : this.provinces;
    
      // แสดงข้อมูลตามหน้า
      this.displayedProvinces = filteredProvinces.slice(start, end);
   
    const provinceLabels = this.isFilterActive
    ? this.filteredProvinces.filter(province => province.selected).map(province => province.name_th).slice(start, end)
    : this.displayedProvinces.map(province => province.name_th)

      // console.log("this.itemsPerPage: ",this.itemsPerPage)
      console.log("this.displayedProvinces.length createChart: ",this.displayedProvinces.length)
      console.log("provinceLabels createChart: ",provinceLabels)
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: provinceLabels,
          datasets: [
            {
              label: 'เอกสารที่ถูกสร้าง',
              data:[65, 59, 80, 81, 56, 55, 40, 80, 81, 56].slice(0, this.displayedProvinces.length) ,//
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1
            },
            {
              label: 'ผู้ใข้งาน',
              data:[65, 48, 40, 19, 86, 27, 90,48, 40, 19].slice(0, this.displayedProvinces.length) , //
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

    createDonutChart(): void {
      const ctx = document.getElementById('myDonutChart') as HTMLCanvasElement | null;
    
      if (!ctx) {
        console.error('Canvas element with ID "myDonutChart" not found');
        return;
      }
    
      const customPlugin = {
        id: 'custom-plugin',
        beforeDraw: (chart: Chart) => {
          const width = chart.width;
          const height = chart.height;
          const ctx = chart.ctx;
    
          ctx.restore();
          const fontSize = (height / 114).toFixed(2);
          ctx.font = `${fontSize}em 'Sarabun', sans-serif`;
          ctx.textBaseline = 'middle';
          const text = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0).toString();
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2;
    
          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      };
    
      Chart.register(customPlugin);
    
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['เซ็นแล้ว', 'ยังไม่ได้เซ็น'],
          datasets: [{
            data: [300, 50],
            backgroundColor: ['rgb(255, 209, 0,0.2)', 'rgb(195,195,198,0.2)'],
            borderColor: ['rgb(255, 209, 0)','rgb(195,195,198)'],
            borderWidth: 1,
            // borderRadius:10,
          }]
        },
        options: {
          responsive: false,  
          maintainAspectRatio: false,  
          plugins: {
            tooltip: {
              enabled: true
            },
            datalabels: {
              display: true,
              color: 'white',
              font: {
                size: 18,
                family: 'Sarabun, sans-serif'  // กำหนดฟอนต์
              }
            },
            legend: {
              display: true,
              position: 'right',  // ตำแหน่งของ legend
              align: 'center',  // จัดให้อยู่ด้านซ้าย
              labels: {
                boxWidth: 20,  // ความกว้างของสี่เหลี่ยม
                padding: 20,  // ระยะห่างระหว่าง legend กับกราฟ
                font: {
                  family: 'Sarabun, sans-serif',  // กำหนดฟอนต์ของ legend
                  size: 14
                }
              }
            }
          },
          cutout: '70%',
        }
      });
    
      // Unregister the plugin after chart creation to avoid it being used by other charts
      Chart.unregister(customPlugin);
    }
    
    
    
    
    

  }
