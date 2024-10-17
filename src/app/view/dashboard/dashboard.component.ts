import { Component, OnInit, ViewChild, ViewChildren, HostListener, ElementRef, SimpleChanges } from "@angular/core";
import { ProvinceService } from "../thaicounty/thaicounty.service";
import { SharedService } from "app/services/shared.service";
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { subscribeOn, Subscription } from "rxjs";
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Router, NavigationEnd } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import { loginservice } from 'app/layouts/login.services.';
import { DocumentService } from 'app/services/document.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { log } from "console";
import { coerceStringArray } from "@angular/cdk/coercion";


@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  //  provinces: { id: number, name_th: string, selected: boolean }[] = []; // เปลี่ยนเป็น provinces


  //superAdmin count
  userCount: number;
  recordCount: number;
  //Admin count
  SameOrganizationrecordCount: number;
  recordCountWithStatus1: number;
  recordCountWithStatus2:number;
  AgencyPersonCount: number;
  filteredMonth: string | null = null;

  provinces: any[] = [];
  companyData: { [key: string]: any } = {};
  monthlyDataByProvince: { [key: string]: any } = {};


  isAdmin: boolean;
  isSuperAdmin: boolean;
  pdfs: any[] = [];
  errorMessage: string | null = null;
  pdfCount: number = 0;
  currentUser: any;
  totalDocumentsCount: number = 0;
  totalSignedDocumentsCount: number = 0;
  //filter
  allDocuments: any[] = [];
  isFilterActive: boolean = false;
  allProvinces: any[] = [];
  filteredProvinces: any[] = [];
  searchTerm: string = '';
  selectedProvinces: Set<number> = new Set<number>();
  isProvinceDropdownOpen: boolean = false;
  isDateDropdownOpen: boolean = false;
  startDate: string | null = null;
  endDate: string | null = null;
  selectedProvince: string;
  totalDocuments: number = 0;
  dtTrigger: BehaviorSubject<any> = new BehaviorSubject([]);
  totalSignedDocuments: number = 0;
  totalCompanies: number = 0;
  //chart
  chart: any; // ใช้สำหรับ Bar Chart
  donutChart: any; // ตัวแปรใหม่ที่ใช้สำหรับ Donut Chart
  displayedProvinces: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  loading: boolean = true;
  routerSubscription: Subscription;

  ///land add(pdf count)//
  totalPdfPages: number = 0;


  //การส่งข้อมูลไปยัง component อื่น เช่น <app-thaicounty></app-thaicounty>
  filterCriteria = null;
  userCount2: number;

  testData:any; //for test

  //get data by ID
  userId: string | undefined;
  AgencyID: string | undefined;
  AgencyData: any
  DataSameOrganization: any
  @ViewChild('provinceSelect') provinceSelect: MatSelect;
  constructor(
    private provinceService: ProvinceService,
    private sv: SharedService,
    private authService: AuthService,
    private router: Router,
    private eRef: ElementRef,
    private loginservice: loginservice,
    private documentService: DocumentService,

  ) {
    this.isAdmin = false;
    this.isSuperAdmin = false;
  }


  ngOnInit(): void {
    this.loadProvinces();
    //super admin count
    this.sv.getRecordCount().subscribe(
      count => {
        this.recordCount = count;
      },
      error => {
        console.error(error);
      }
    );

    this.sv.getUserCount().subscribe(res => {
      this.userCount = res;
      // console.log("user count: ",this.userCount)
    },
      error => {
        console.error(error);
      });




    // Create the chart
    this.setupRouterSubscription();
    // this.loadUserReport();
    this.provinceService.getProvinces().subscribe(data => {

      this.provinces = data; // เก็บข้อมูลจังหวัดทั้งหมดใน component
      this.loadUser();
      this.loading = false;
      this.dtTrigger.next(this.provinces);
    });
    this.loadPDFs()
    this.documentService.userCount$.subscribe(count => {
      this.userCount2 = count;
      // console.log("User count updated in AnotherComponent:", this.userCount2);
    });

    this.documentService.totalDocumentsCount$.subscribe(count => {
      this.totalDocumentsCount = count;
      // console.log("Total documents count updated in Component:", this.totalDocumentsCount);
    });
    this.documentService.signedDocumentsCount$.subscribe(count => {
      this.totalSignedDocumentsCount = count;
      // console.log("Total documents count updated in Component:", this.totalSignedDocumentsCount);
    });

    this.documentService.getTotalCompanies().subscribe(res => {
      this.totalCompanies = res;
      //  console.log(" จาก serveice",this.totalCompanies);
    })
    // this.documentService.companyCount$.subscribe(count => {
    //   this.totalCompanies = count;
    //   // console.log("Total compony count updated in Component:", this.totalCompanies);
    // });


    ///land add(pdf count)//
    this.documentService.getPdfFiles().subscribe({
      next: (pdfFiles) => {
        console.log('PDF files:', pdfFiles);
        const pdfUrls = pdfFiles.map(file => `assets/pdf/${file}`);
        this.documentService.getTotalPagesCount(pdfUrls).then((totalPages: number) => {
          this.totalPdfPages = totalPages;
          // console.log('จำนวนหน้าทั้งหมดของ PDF:', this.totalPdfPages);
        }).catch(error => {
          console.error('เกิดข้อผิดพลาดในการคำนวณจำนวนหน้า:', error);
        });
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงไฟล์ PDF:', error);
      }
    });



    // this.documentService.getTotalPdfPages().subscribe(data => {
    //   console.log('Total Pages:', data.totalPages); // ตรวจสอบข้อมูล
    //   this.totalPdfPages = data.totalPages;
    // });

    // this.getAllRecordsWithEmployees();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterCriteria']) {
      // console.log('FilterCriteria changed: ', changes['filterCriteria'].currentValue);
      if (this.filterCriteria) {
        this.applyFilter();
      }
    }
  }


  //ถ้าเอา  filterProvinces ไปใส่ใน apply แล้วข้อมูลจะหายไป
  filterProvinces() {
    if (this.filterCriteria && this.filterCriteria.selectedProvinces) {
      const selectedIds = this.filterCriteria.selectedProvinces; // Get selected province IDs

      this.filteredProvinces = this.provinces.filter(province =>
        selectedIds.includes(province.id) // Check if province ID is in selected IDs

      );
      // console.log('Filtered Provinces:', this.provinces);
      console.log('Filtered Provinces:', this.filteredProvinces);
      // Update DataTable with filtered data
      // this.dtTrigger.next(this.filteredProvinces);
      // this.createChart();
      // $(document).ready(() => {
      //   const table = $('#yourDataTableId').DataTable(); // Update this with your table ID
      //   table.clear(); // Clear existing data
      //   table.rows.add(this.provinces); // Add new data
      //   table.draw(); // Redraw the table
      // });
    }
  }


  //fiter date สำหรับเฉพาะ admin
  filterChartData() {
    if (this.startDate && this.endDate) {
      console.log("Start Date: ", this.startDate);
      console.log("End Date: ", this.endDate);

      const startDateObj = new Date(this.startDate);
      startDateObj.setHours(0, 0, 0, 0); // ตั้งค่าเวลาเป็น 00:00:00
      const endDateObj = new Date(this.endDate);
      endDateObj.setHours(23, 59, 59, 999); // ตั้งค่าสิ้นสุดที่เวลา 23:59:59.999
      // console.log("startDateObj: ", startDateObj)

      const filteredData = this.DataSameOrganization.filter(item => {
        // ตรวจสอบว่า createdDate มีค่า
        if (!item.record || !item.record?.createdDate || typeof item.record?.createdDate !== 'string') {
          console.warn("Invalid createdDate:", item.record?.createdDate);
          return false; // ไม่รวม item นี้ในการกรอง
        }

        const createdDate = this.convertToDate(item.record?.createdDate);
        console.log("Original createdDate: ", item.record?.createdDate); // ดูค่า createdDate
        console.log("Converted createdDate: ", createdDate); // ดูค่าหลังแปลง
        if (!createdDate) {
          return false; // หากแปลงวันที่ไม่สำเร็จ ไม่รวม item นี้
        }
        // แสดงการเปรียบเทียบวันที่
        console.log("Comparing:", createdDate, ">=", startDateObj, "&&", createdDate, "<=", endDateObj);
        return createdDate >= startDateObj && createdDate <= endDateObj;
      });
      // แสดงข้อมูลที่กรอง
      console.log("Filtered Data: ", filteredData);

      // อัปเดตค่าของ SameOrganizationrecordCount และ recordCountWithStatus1 ตามข้อมูลที่กรองแล้ว
      // this.SameOrganizationrecordCount = filteredData.length;
      // this.recordCountWithStatus1 = filteredData.filter(item => {
      //   if (typeof item.record.status !== 'number') {
      //     console.warn("Invalid status:", item.record.status);
      //     return false; // ไม่รวม item นี้ในการกรอง
      //   }
      //   return Number(item.record.status) === 1;
      // }).length;

      // console.log("Filtered SameOrganizationrecordCount: ", this.SameOrganizationrecordCount);
      // console.log("Filtered recordCountWithStatus1: ", this.recordCountWithStatus1);




      // อัปเดตกราฟด้วยข้อมูลที่กรองแล้ว เช็คข้อมูลก่อน??
      this.createMonthlyChart(filteredData);

    }
  }


  private setupRouterSubscription() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/dashboard') {
          setTimeout(() => {
            if (!this.chart) {
              this.createChart();
            }
            if (!this.donutChart) {
              this.createDonutChart();
            }
          }, 0);
        } else {
          if (this.chart) {
            this.chart.destroy();
            this.chart = null;
          }
          if (this.donutChart) {
            this.donutChart.destroy();
            this.donutChart = null;
          }
        }
      }
    });
  }
  // ngAfterViewInit(): void {
  //   Chart.register(...registerables);
  //   if (this.router.url === '/dashboard') {
  //     if (!this.chart) {
  //       this.createChart();
  //     }
  //     if (!this.donutChart) {
  //       this.createDonutChart();
  //     }
  //   }

  // }
  ngAfterViewInit(): void {
    Chart.register(...registerables);
    setTimeout(() => {
      if (this.router.url === '/dashboard') {
        if (!this.chart) {
          this.createChart();
          this.createMonthlyChart(this.DataSameOrganization);
        }
        if (!this.donutChart) {
          this.createDonutChart();
        }
      }
    }, 100); // ปรับเวลาตามที่ต้องการ
  }
  ngOnDestroy(): void {
    if (this.chart) {
      try {
        this.chart.destroy();
        this.chart = null; // กำหนดค่าเป็น null หลังจากทำลาย
      } catch (error) {
        // console.error("Error destroying chart:", error);
      }
    }

    if (this.donutChart) {
      try {
        this.donutChart.destroy();
        this.donutChart = null; // กำหนดค่าเป็น null หลังจากทำลาย
      } catch (error) {
        // console.error("Error destroying donut chart:", error);
      }
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.dtTrigger.unsubscribe();
  }



  onProvinceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProvince = target.value;

    // ตรวจสอบการเลือก "เลือกทั้งหมด"
    if (this.selectedProvince === "") {
      // console.log("เลือกทั้งหมด");
    } else {
      const selectedProvinceData = this.provinces.find(
        (province) => province.name === this.selectedProvince
      );
      // console.log("Selected Province:", selectedProvinceData);
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
        this.allProvinces = [...this.provinces];
        this.filteredProvinces = [...this.provinces];
        // console.log("Provinces:", this.provinces);

        this.totalPages = Math.ceil(this.provinces.length / this.itemsPerPage);
        this.updateDisplayedProvinces();
      },
      (error) => {
        // console.error("Error fetching provinces:", error);
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

  toggleDropdown(type: string, event: Event): void {

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
    this.toggleDropdown('date', event);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.searchTerm = searchTerm; // อัปเดต searchTerm
    this.allProvinces = this.provinces.filter(province =>
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
    console.log("จังหวัดที่ map : ", province)

    if (province) {
      province.selected = isChecked;
      if (isChecked) {
        this.selectedProvinces.add(provinceId);
      } else {
        this.selectedProvinces.delete(provinceId);
      }
    }
    this.filterProvinces();
  }
  applyFilter() {
    const selectedProvincesArray = Array.from(this.selectedProvinces);
    console.log('Selected Provinces: ', selectedProvincesArray);
    this.filterCriteria = { selectedProvinces: selectedProvincesArray };
    this.isFilterActive = true;
    this.currentPage = 1;
    this.isProvinceDropdownOpen = false;
    this.filterProvinces();
    this.updateDisplayedProvinces();

    // if (this.filterCriteria) {
    //   // console.log('Applying filter with criteria: ', this.filterCriteria);
    //   // โค้ดการกรองข้อมูลตาม this.filterCriteria
    //   this.filterProvinces();
    // }
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
      this.isFilterActive = false;
    });


   // แทนการส่งค่า [] ว่าง ให้ส่งค่า refresh ไปแทน
   this.filterCriteria = {
    refresh: true // เพิ่มตัวบ่งชี้ว่าเป็นการรีเฟรช
  };
    this.loadAllProvinces();
    // this.loadProvinces();

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
      // console.log("this.itemsPerPage: ",this.itemsPerPage)
      // console.log("this.displayedProvinces.length: ",this.displayedProvinces.length)
      // console.log("this.displayedProvinces: ",this.displayedProvinces)
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedProvinces();
    }
  }


  provinceData: { [provinceName: string]: { users: any[], documentCount: number, signedDocuments: number } } = {};
  monthlyData: { [month: string]: { documentCount: number; signedDocuments: number } } = {};

  // เพื่อการรวมข้อมูล ระหว่าง ข้อมูลบริษัท(agencies) ข้อมูลพนักงาน (Employee) ข้อมูล เอกสาร (record)
  //  const agencies = 
  //  const Employee =   recordData;




  //super admin chart
  createChart(): void {
    const canvas = document.getElementById('myLineChart') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('ไม่พบองค์ประกอบ Canvas ที่มี ID "#myLineChart"');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('ไม่สามารถรับบริบทของ Canvas ได้');
      return;
    }
    if (this.chart) {
      this.chart.destroy();
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    const filteredProvinces = this.isFilterActive
      ? this.filteredProvinces.filter(province => province.selected)
      : this.provinces;

    this.displayedProvinces = filteredProvinces.slice(start, end);

    const filteredProvinceLabels = this.isFilterActive
      ? this.filteredProvinces.filter(province => province.selected).map(province => province.name_th).slice(start, end)
      : this.displayedProvinces.map(province => province.name_th);

    const userCounts = filteredProvinceLabels.map(label => this.provinceData[label]?.users.length || 0);
    const documentCounts = filteredProvinceLabels.map(label => this.provinceData[label]?.documentCount || 0);
    const totalDocuments = this.totalDocuments;
    const totalSignedDocuments = this.totalSignedDocuments;
    // console.log("Province Labels:", filteredProvinceLabels);
    // console.log("User Counts:", userCounts);
    // console.log("Document Counts:", documentCounts);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: filteredProvinceLabels,
        datasets: [
          {
            label: 'จำนวนเอกสาร',
            data: this.displayedProvinces.map(province => province.count), // แก้ไขตรงนี้
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          },
          {
            label: 'จำนวนเอกสารที่ลงนามแล้ว',
            data: this.displayedProvinces.map(province => province.signedDocuments), // แก้ไขตรงนี้
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
            stacked: false
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  createDonutChart(): void {
    const ctx = document.getElementById('myDonutChart') as HTMLCanvasElement | null;

    if (!ctx) {
      console.error('ไม่พบองค์ประกอบ Canvas ที่มี ID "myDonutChart"');
      return;
    }

    let totalDocuments = 0;
    let totalSignedDocuments = 0;
    // console.log("this.SameOrganizationrecordCount  : ", this.SameOrganizationrecordCount)
    // console.log("this.SameOrganizationrecordCount  : ", this.recordCountWithStatus1)

    if (this.isAdmin) {


      // ถ้าเป็น admin ใช้ข้อมูลจาก DocumentService
      totalDocuments = this.SameOrganizationrecordCount || 0; //petch แก้ไขนะ this.SameOrganizationrecordCount this.totalDocumentsCount 
      totalSignedDocuments = this.recordCountWithStatus1 || 0;//this.totalSignedDocumentsCount
    } else {//petch แก้ไขนะthis.recordCountWithStatus1
      // ถ้าไม่ใช่ admin (เช่น superadmin) ใช้ข้อมูลเดิม
      totalDocuments = this.totalDocuments || 0;
      totalSignedDocuments = this.totalSignedDocuments || 0;
    }

    // การจัดการค่าศูนย์เพื่อป้องกันการเกิดข้อผิดพลาด
    if (totalDocuments === 0) {
      totalDocuments = 1;  // กำหนดค่าเป็น 1 เพื่อให้กราฟแสดงได้
    }

    const unsignedDocuments = totalDocuments - totalSignedDocuments;

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['เอกสารลงนาม', 'เอกสารยังไม่ลงนาม'],
        datasets: [{
          data: [totalSignedDocuments, unsignedDocuments],
          backgroundColor: ['rgba(255, 209, 0, 0.7)', 'rgba(195, 195, 198, 0.7)'],
          borderColor: ['rgb(255, 209, 0)', 'rgb(195, 195, 198)'],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 90,  // ระยะห่างจากขอบซ้าย
          }
        },
        plugins: {
          tooltip: {
            enabled: true
          },
          datalabels: {
            display: true,
            color: 'white',
            font: {
              size: 18,
              family: 'Sarabun, sans-serif'
            }
          },
          legend: {
            display: true,
            position: 'right',
            labels: {
              boxWidth: 20,
              padding: 20,
              font: {
                family: 'Sarabun, sans-serif',
                size: 14
              }
            }
          }
        },
        cutout: '70%',
      }
    });
  }

  //การแปลงค่าตัวแปรที่อยู่ในฐานข้อมูล createdDat
  convertToDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      console.error("Invalid date string:", dateString);
      return null; // คืนค่า null หากไม่ใช่สตริงที่ถูกต้อง
    }

    const regex = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
    const match = dateString.match(regex);

    if (match) {
      let [_, day, month, year] = match;

      // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
      year = (parseInt(year, 10) - 543).toString(); // แปลงจากปีพุทธศักราช

      return new Date(`${year}-${month}-${day}`);
    }

    console.error("Date format not recognized:", dateString);
    return null; // คืนค่า null หากรูปแบบวันที่ไม่ถูกต้อง
  }
  createMonthlyChart(data: any[]): void {

    if (!Array.isArray(data)) {
      return;
      console.error("Invalid data provided to createMonthlyChart: expected an array but got", data);
      return;
    }
    // console.log('Creating monthly chart for admin');
    const canvas = document.getElementById('myMonthlyChart') as HTMLCanvasElement | null;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    if (this.chart) {
      this.chart.destroy();
    }

    // กำหนดเดือนในภาษาไทย
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    // นับจำนวนเอกสารที่ถูกสร้างและลงนามแล้วต่อเดือน
    const monthlyDocumentCounts = new Array(12).fill(0);
    const monthlySignedDocuments = new Array(12).fill(0);

    // กำหนดค่าวันที่เริ่มต้นและสิ้นสุด
    const startDateObj = new Date(this.startDate);
    const endDateObj = new Date(this.endDate);
    endDateObj.setHours(23, 59, 59, 999); // ปรับเวลาให้ครบถ้วน

    // กำหนดให้เริ่มต้นเป็น null
    this.filteredMonth = null;
    // ตรวจสอบการฟิลเตอร์เดือน
    if (startDateObj && endDateObj) {
      const startDateObj = new Date(this.startDate);
      const endDateObj = new Date(this.endDate);
      // ถ้า startDate และ endDate ตรงกันและอยู่ในเดือนเดียวกัน
      if (startDateObj.getMonth() === endDateObj.getMonth() && startDateObj.getFullYear() === endDateObj.getFullYear()) {
        this.filteredMonth = months[startDateObj.getMonth()];
        console.log("เดือน : ", this.filteredMonth)
      } else {
        this.filteredMonth = null; // ถ้าไม่มีการฟิลเตอร์หรือหลายเดือน
        console.log("เดือน : ", this.filteredMonth)
      }
    } else {
      this.filteredMonth = null; // ถ้าไม่มี startDate หรือ endDate
    }

    // นับเอกสาร
    data.filter(item => item.record).forEach(item => {
      const createdDate = this.convertToDate(item.record.createdDate);
      // console.log('Created Date:', createdDate, 'Original Date:', item.record.createdDate);
      const monthIndex = createdDate.getMonth();
      monthlyDocumentCounts[monthIndex]++;
      if (Number(item.record.status) === 1) {
        monthlySignedDocuments[monthIndex]++;
      }
    });


    // เริ่มต้นด้วยการใช้ labels เป็นเดือน
    let filteredLabels = months;
    let filteredDocumentCounts = monthlyDocumentCounts.slice();
    let filteredSignedDocuments = monthlySignedDocuments.slice();

    // หากมีการกรองวันที่เริ่มต้นและสิ้นสุด
    if (this.startDate && this.endDate) {
      const startDateObj = new Date(this.startDate); // ตรวจสอบการแปลงวันที่เริ่มต้น
      const endDateObj = new Date(this.endDate); // ตรวจสอบการแปลงวันที่สิ้นสุด
      const filterMonth = startDateObj.getMonth();
      const filterYear = startDateObj.getFullYear();

      // ตรวจสอบว่าช่วงวันที่อยู่ในเดือนและปีเดียวกันหรือไม่
      if (filterMonth === endDateObj.getMonth() && filterYear === endDateObj.getFullYear()) {
        // เปลี่ยน labels เป็นวันของเดือนนั้น
        const daysInMonth = new Date(filterYear, filterMonth + 1, 0).getDate();
        filteredLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()); // สร้าง labels เป็นวัน

        filteredDocumentCounts = new Array(daysInMonth).fill(0);
        filteredSignedDocuments = new Array(daysInMonth).fill(0);

        // นับเอกสารที่ตรงกับแต่ละวันในเดือนที่ถูกกรอง
        data.filter(item => item.record).forEach(item => {
          const createdDate = this.convertToDate(item.record.createdDate);
          console.log('Created Date:', createdDate); // Debug เพื่อตรวจสอบวันที่

          // ตรวจสอบว่า createdDate อยู่ในช่วง startDate และ endDate หรือไม่
          if (
            createdDate.getFullYear() === filterYear &&
            createdDate.getMonth() === filterMonth &&
            createdDate >= startDateObj && createdDate <= endDateObj
          ) {
            const day = createdDate.getDate() - 1; // วันที่ใน array เริ่มที่ 0
            console.log('Day:', day + 1); // ตรวจสอบวัน
            filteredDocumentCounts[day]++;
            if (Number(item.record.status) === 1) {
              filteredSignedDocuments[day]++;
            }
          }
        });
      }
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: filteredLabels,
        datasets: [
          {
            label: 'จำนวนเอกสาร',
            data: filteredDocumentCounts,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          },
          {
            label: 'จำนวนเอกสารที่ลงนามแล้ว',
            data: filteredSignedDocuments,
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
            stacked: false
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  loadPDFs(): void {
    this.sv.getAllPDFs().subscribe(
      data => {
        this.pdfs = data;
        this.pdfCount = this.pdfs.length; // Count the number of PDFs
        // console.log('PDFs:', this.pdfs);
        // console.log('Number of PDFs:', this.pdfCount); // Log the count

        // Update the donut chart after loading PDFs
        this.createDonutChart();
        this.loadUser()
      },
      error => {
        this.errorMessage = error; // Handle the error
        // console.error('Error loading PDFs:', error);
      }
    );


  }

  processProvinceData(documents: any[]): void {
    this.provinceData = {};  // รีเซ็ตข้อมูลของจังหวัด
    this.totalDocuments = 0;
    this.totalSignedDocuments = 0;

    // วนลูปเอกสารแต่ละชุด
    documents.forEach(document => {
      // ตรวจสอบว่ามี agency และ province ก่อนที่จะเข้าถึง
      if (!document.agency || !document.agency.province) {
        return; // ข้ามเอกสารที่ไม่มีข้อมูล agency หรือ province
      }

      // นับจำนวนเอกสารภายใน document
      document.documentCount = document.documents.length;

      // ดึงข้อมูล provinceId และ provinceName จาก agency
      const provinceId = parseInt(document.agency.province, 10);  // ใช้ province จาก agency
      const provinceName = this.provinceService.getProvinceNameById(provinceId, this.provinces);

      if (!provinceName || provinceName === 'ไม่ทราบจังหวัด') {
        return; // ถ้าไม่มีชื่อจังหวัดให้ข้าม
      }

      // ตรวจสอบว่ามี provinceName ใน this.provinceData หรือไม่ ถ้าไม่มีให้สร้างใหม่
      if (!this.provinceData[provinceName]) {
        this.provinceData[provinceName] = { users: [], documentCount: 0, signedDocuments: 0 };
      }

      // เพิ่มข้อมูล user และนับจำนวนเอกสารในจังหวัดนั้นๆ
      this.provinceData[provinceName].users.push(document);
      this.provinceData[provinceName].documentCount += document.documentCount;

      // วนลูปเอกสารใน documents เพื่อเช็คเอกสารที่มีการลงนาม
      document.documents.forEach(doc => {
        if (!doc._id) {
          return; // ข้ามเอกสารที่ไม่มี _id
        }

        // เช็คว่าเอกสารนี้ถูกลงนามหรือไม่
        if (this.pdfs.includes(`${doc._id}.pdf`)) {
          this.provinceData[provinceName].signedDocuments += 1;
        }
      });
    });

    // บวก totalDocuments และ totalSignedDocuments หลังจากลูปเสร็จ
    for (const provinceName in this.provinceData) {
      this.totalDocuments += this.provinceData[provinceName].documentCount;
      this.totalSignedDocuments += this.provinceData[provinceName].signedDocuments;
    }

    // รีเซ็ตข้อมูลจังหวัดทั้งหมด
    this.provinces.forEach(province => {
      province.count = 0;
      province.signedDocuments = 0;
      province.percentage = 0;
    });

    // อัพเดตข้อมูลจังหวัดตามข้อมูลที่ประมวลผลแล้ว
    this.provinces.forEach(province => {
      const provinceName = province.name_th;
      if (this.provinceData[provinceName]) {
        province.count = this.provinceData[provinceName].documentCount;
        province.signedDocuments = this.provinceData[provinceName].signedDocuments;

        // คำนวณเปอร์เซ็นต์ของเอกสารที่ลงนาม
        if (province.count > 0) {
          province.percentage = (province.signedDocuments / province.count) * 100;
        } else {
          province.percentage = 0;
        }
      }
    });
  }


  private englishToThaiMonthMap: { [key: string]: string } = {
    January: 'มกราคม',
    February: 'กุมภาพันธ์',
    March: 'มีนาคม',
    April: 'เมษายน',
    May: 'พฤษภาคม',
    June: 'มิถุนายน',
    July: 'กรกฎาคม',
    August: 'สิงหาคม',
    September: 'กันยายน',
    October: 'ตุลาคม',
    November: 'พฤศจิกายน',
    December: 'ธันวาคม'
  };

  groupByCompany(documents: any[]): void {
    this.companyData = {};
    const userCompany = this.currentUser.employeeId.organization;

    documents.forEach(record => {
      const companyName = record.employee.organization;

      if (!companyName || companyName !== userCompany) {
        return;
      }

      if (!this.companyData[companyName]) {
        this.companyData[companyName] = {
          monthlyData: {}
        };
      }

      record.documents.forEach(doc => {
        if (doc.record_star_date) {
          const englishMonth = new Date(doc.record_star_date).toLocaleString('default', { month: 'long' });
          const thaiMonth = this.englishToThaiMonthMap[englishMonth]; // แปลงเป็นเดือนภาษาไทย

          if (!this.companyData[companyName].monthlyData[thaiMonth]) {
            this.companyData[companyName].monthlyData[thaiMonth] = {
              documentCount: 0,
              signedDocuments: 0
            };
          }

          this.companyData[companyName].monthlyData[thaiMonth].documentCount += 1;

          if (this.pdfs.includes(`${doc._id}.pdf`)) {
            this.companyData[companyName].monthlyData[thaiMonth].signedDocuments += 1;
          }
        } else {
          console.warn(`Document ${doc._id} does not have a valid start date.`);
        }
      });
    });

    // console.log('Grouped data for the user\'s company:', this.companyData);
  }

  loadUser(): void {
    this.loginservice.getUserProfile().subscribe(
      user => {
        if (user && user._id) {
          this.userId = user._id;
          this.AgencyID = user?.employeeId.agencies
          const role = user.role;
          const userCompany = user.employeeId.organization;
          const loadDocuments = (documents: any[]) => {
            this.allDocuments = documents;
            this.currentUser = user;
            this.isAdmin = role === 'admin';
            this.isSuperAdmin = role === 'superadmin';

            console.log("curren ID: ", this.userId);
            this.getAllSameOrganization(this.userId)

            // ประมวลผลข้อมูลตามบทบาท
            if (this.isSuperAdmin) {
              this.processProvinceData(documents);
              this.createChart();
            } else if (this.isAdmin) {
              this.groupByCompany(documents);
              this.createMonthlyChart(this.DataSameOrganization);
            }
            // this.createChart();
            this.createMonthlyChart(this.DataSameOrganization);


            this.createDonutChart(); // เรียกใช้กราฟโดนัทที่ต้องการ

            this.dtTrigger.next(this.provinces);
          };

          this.sv.getAllRecordsLinkedByEmployeeId().subscribe(
            recordData => {
              if (recordData && recordData.length > 0) {
                loadDocuments(recordData);
                // console.log("getAllRecordsLinkedByEmployeeId : ",recordData);
              } else {
                console.error('ไม่พบเอกสาร');
              }
            },
            error => {
              console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
            }
          );
          this.sv.getOrganizationById(this.AgencyID).subscribe(res => {
            this.AgencyData = res;
            console.log("ข้อมูลบริษัท: ", this.AgencyData)
          });
          this.sv.getPersonsWithSameOrganization(this.AgencyID).subscribe(res => {
            this.AgencyPersonCount = res.length;
            console.log("จำนวนบุคคลกร: ", this.AgencyPersonCount)
          })
        } else {
          console.error('User ID is undefined or null.');
        }
      },
      error => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  

  getAllSameOrganization(currentUserId) {
    if (!currentUserId) {
      console.log("ไม่ได้รับ currentUserId มา: ", currentUserId)
    }

    this.sv.getDataRecordWithSameOrganization(currentUserId).subscribe(res => {
      this.DataSameOrganization = res;
      console.log("DataSameOrganization: ", this.DataSameOrganization)

      // นับเฉพาะข้อมูลที่มี field 'record'
      this.SameOrganizationrecordCount = this.DataSameOrganization.filter(item => item.record).length;
      // console.log("จำนวน record ใน DataSameOrganization: ", this.SameOrganizationrecordCount);
      // นับเฉพาะข้อมูลที่มี field 'record'
      this.recordCountWithStatus1 = this.DataSameOrganization.filter(item => item.record && Number(item.record.status) === 1).length;
      // console.log("จำนวน record ที่มี status = 1: ", this.recordCountWithStatus1);
      // นับเฉพาะข้อมูลที่มี field 'record'
      this.recordCountWithStatus2 = this.DataSameOrganization.filter(item => item.record && Number(item.record.status) === 2).length;
      // console.log("จำนวน record ที่มี status = 2: ", this.recordCountWithStatus2);
      this.createDonutChart();
      this.createMonthlyChart(this.DataSameOrganization);
    })


  }
  getProvinceName(id: number): string {
    // ตรวจสอบประเภทของ id และแปลงให้ตรงกันถ้าจำเป็น
    const provinceId = Number(id);
    // ตรวจสอบข้อมูลใน provinces
    // console.log('All Provinces:', this.provinces);
    const province = this.provinces.find((p) => p.id === provinceId);
    // console.log(`Searching for Province ID: ${provinceId}. Found:`, province);
    return province ? province.name_th : "Not Found";
  }
  getAllRecordsWithEmployees(){
    this.sv.getAllRecordsWithEmployees().subscribe(res=>{
      this.testData = res;
      console.log("testData form getAllRecordsWithEmployees: ",this.testData) 
    })
  }

}
