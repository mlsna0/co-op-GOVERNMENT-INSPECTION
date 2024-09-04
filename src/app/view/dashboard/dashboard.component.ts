import { Component, OnInit,ViewChild,ViewChildren,HostListener,ElementRef ,SimpleChanges} from "@angular/core";
import { ProvinceService } from "../thaicounty/thaicounty.service";
import { SharedService } from "app/services/shared.service";
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { subscribeOn,Subscription } from "rxjs";
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
  provinces:any[] = []; 
  recordCount:number;
  userCount:number;
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
  @ViewChild('provinceSelect') provinceSelect: MatSelect;
  constructor(
    private provinceService: ProvinceService,
    private sv:SharedService,
    private authService: AuthService,    
    private router: Router,
    private  eRef: ElementRef,
    private loginservice: loginservice, 
    private documentService: DocumentService,
    
  ) {
    this.isAdmin = false;
    this.isSuperAdmin = false;
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
      console.log("User count updated in AnotherComponent:", this.userCount2);
    });
    
      this.documentService.totalDocumentsCount$.subscribe(count => {
        this.totalDocumentsCount = count;
        console.log("Total documents count updated in Component:", this.totalDocumentsCount);
      });
      this.documentService.signedDocumentsCount$.subscribe(count => {
        this.totalSignedDocumentsCount = count;
        console.log("Total documents count updated in Component:", this.totalSignedDocumentsCount);
      });


       ///land add(pdf count)//
      // this.documentService.getPdfFiles().subscribe(pdfFiles => {
      //   const pdfUrls = pdfFiles.map(file => `assets/pdf/${file}`);
      //   this.documentService.getTotalPagesCount(pdfUrls).then((totalPages: number) => {
      //     this.totalPdfPages = totalPages;
      //     console.log('จำนวนหน้าทั้งหมดของ PDF:', this.totalPdfPages);
      //   }).catch(error => {
      //     console.error('เกิดข้อผิดพลาดในการคำนวณจำนวนหน้า:', error);
      //   });
      // });
      
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterCriteria']) {
      // console.log('FilterCriteria changed: ', changes['filterCriteria'].currentValue);
      if (this.filterCriteria) {
        this.applyFilter();
      }
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

    if (this.filterCriteria) {
      // console.log('Applying filter with criteria: ', this.filterCriteria);
      // โค้ดการกรองข้อมูลตาม this.filterCriteria
      this.filterProvinces();
    }
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
    // console.log('Start Date:', this.startDate);
    // console.log('End Date:', this.endDate);
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
  
 createChart(): void {
  const canvas = document.getElementById('myLineChart') as HTMLCanvasElement | null;
  if (!canvas) {
      // console.error('ไม่พบองค์ประกอบ Canvas ที่มี ID "myLineChart"');
      return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
      // console.error('ไม่สามารถรับบริบทของ Canvas ได้');
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

  if (this.isAdmin) {
    // ถ้าเป็น admin ใช้ข้อมูลจาก DocumentService
    totalDocuments = this.totalDocumentsCount || 0;
    totalSignedDocuments = this.totalSignedDocumentsCount || 0;
  } else {
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
  
  createMonthlyChart(): void {
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

    // ดึงข้อมูลรายเดือนจาก monthlyData
    const monthlyDocumentCounts = months.map(month => this.monthlyData[month]?.documentCount || 0);
    const monthlySignedDocuments = months.map(month => this.monthlyData[month]?.signedDocuments || 0);

    this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'จำนวนเอกสาร',
                    data: monthlyDocumentCounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                },
                {
                    label: 'จำนวนเอกสารที่ลงนามแล้ว',
                    data: monthlySignedDocuments,
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
        console.log('PDFs:', this.pdfs);
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

    console.log('Starting processProvinceData with documents:', documents);

    documents.forEach(document => {
        // นับจำนวนเอกสารภายใน document
        document.documentCount = document.documents.length;
        // console.log(`Processing document for employee: ${document.employee.province}, documentCount: ${document.documentCount}`);
        const provinceApi = document.employee?.province
        // ดึง provinceId และ provinceName จากเอกสาร
        const provinceId = parseInt(provinceApi, 10);
        const provinceName = this.provinceService.getProvinceNameById(provinceId, this.provinces);
        // console.log(`Province ID: ${provinceId}, Province Name: ${provinceName}`);

        if (!provinceName || provinceName === 'ไม่ทราบจังหวัด') {
            // console.warn(`Skipping document as province name is not valid: ${provinceName}`);
            return;
        }

        // ตรวจสอบว่ามี provinceName ใน this.provinceData หรือไม่ ถ้าไม่มีให้สร้างใหม่
        if (!this.provinceData[provinceName]) {
            this.provinceData[provinceName] = { users: [], documentCount: 0, signedDocuments: 0 };
            // console.log(`Initializing province data for: ${provinceName}`);
        }

        this.provinceData[provinceName].users.push(document);
        this.provinceData[provinceName].documentCount += document.documentCount;
        // console.log(`Updated province data for ${provinceName}:`, this.provinceData[provinceName]);

        // วนลูปภายในเอกสารเพื่อเช็คเอกสารที่มีการลงนาม
        document.documents.forEach(doc => {
            // ตรวจสอบว่า doc._id มีค่าอยู่จริงหรือไม่
            if (!doc._id) {
                // console.error(`documentId is undefined or null for document: ${JSON.stringify(doc)}`);
                return;
            }

            // แสดงค่า doc._id ก่อนทำการเปรียบเทียบ
            // console.log(`Checking document _id: ${doc._id}`);

            // ตรวจสอบและแสดงค่า pdf.name ที่มีอยู่ใน this.pdfs
            this.pdfs.forEach(pdf => {
                // console.log(`PDF name: ${pdf.name}`);
            });

            // เช็คว่ามีการจับคู่กันหรือไม่
            if  (this.pdfs.includes(`${doc._id}.pdf`)) {
                this.provinceData[provinceName].signedDocuments += 1;
                // console.log(`Match found: PDF name matches with document _id: ${doc._id}`);
            } else {
                // console.log(`No match found for document _id: ${doc._id}`);
            }
        });

        // อัพเดตข้อมูลรวมของเอกสารและเอกสารที่ลงนาม
        this.totalDocuments += this.provinceData[provinceName].documentCount;
        this.totalSignedDocuments += this.provinceData[provinceName].signedDocuments;
        // console.log(`Total Documents: ${this.totalDocuments}, Total Signed Documents: ${this.totalSignedDocuments}`);
    });

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

            if (province.count > 0) {
                province.percentage = (province.signedDocuments / province.count) * 100;
            } else {
                province.percentage = 0;
            }
            // console.log(`Updated province: ${provinceName}, Count: ${province.count}, Signed: ${province.signedDocuments}, Percentage: ${province.percentage}`);
        }
    });

    // console.log('Finished processing province data:', this.provinceData);
}
processMonthlyData(): void {
  if (!this.isAdmin) {
      // console.log("Not an admin user, skipping monthly data processing.");
      return;  // ถ้าไม่ใช่ Admin ไม่ต้องทำอะไรต่อ
  }

  this.monthlyData = {};  // เริ่มต้นข้อมูลสำหรับแยกตามเดือน

  // ดึงจังหวัดของผู้ใช้ Admin
  // console.log('currentUser:', this.currentUser.employeeId);
  const adminProvinceId = this.currentUser.employeeId.province; // สมมติว่า currentUser มีข้อมูลผู้ใช้ที่ได้จาก loadUser()
  // console.log(adminProvinceId);
  
  const adminProvinceName = this.provinceService.getProvinceNameById(parseInt(adminProvinceId, 10), this.provinces);
  // console.log(adminProvinceName);
  
  // console.log(this.provinceData);
  if (!adminProvinceName || adminProvinceName === 'ไม่ทราบจังหวัด') {
      // console.error("Admin province is unknown or invalid.");
      return; // ออกจากฟังก์ชันหากไม่มีข้อมูลจังหวัดที่ถูกต้อง
  }

  // ใช้ข้อมูลที่จัดกลุ่มตามจังหวัดใน this.provinceData เฉพาะจังหวัดของ Admin
  if (this.provinceData[adminProvinceName]) {
    
      const province = this.provinceData[adminProvinceName];
      province.users.forEach(document => {
          document.documents.forEach(doc => {
              if (!doc.createdDate) {
                  // console.error(`createdDate is undefined or null for document: ${JSON.stringify(doc)}`);
                  return;
              }

              const month = new Date(doc.createdDate).toLocaleString('default', { month: 'long' });

              if (!this.monthlyData[month]) {
                  this.monthlyData[month] = { documentCount: 0, signedDocuments: 0 };
              }

              this.monthlyData[month].documentCount += 1;

              if (this.pdfs.includes(`${doc._id}.pdf`)) {
                  this.monthlyData[month].signedDocuments += 1;
              }
          });
      });

      // แสดงข้อมูลรายเดือนเฉพาะสำหรับจังหวัดของ Admin
      Object.keys(this.monthlyData).forEach(month => {
          // console.log(`${month}: ${this.monthlyData[month].documentCount} documents, ${this.monthlyData[month].signedDocuments} signed`);
      });
  } else {
      // console.log(`No data found for the admin's province: ${adminProvinceName}`);
  }
}

loadUser(): void {
this.loginservice.getUserProfile().subscribe(
  user => {
    if (user && user._id) {
      const userId = user._id;
      const role = user.role;

      const loadDocuments = (documents: any[]) => {
        this.allDocuments = documents;
        this.currentUser = user;  
        this.isAdmin = role === 'admin';
        this.isSuperAdmin = role === 'superadmin';
        // เรียกใช้ฟังก์ชันประมวลผลข้อมูลตามจังหวัด
        console.log(this.currentUser);
          // เรียกใช้ฟังก์ชันประมวลผลข้อมูลตามเดือนสำหรับ Admin
          this.processProvinceData(documents);

          if (this.isAdmin) {
            this.processMonthlyData();
          }
          // เรียกใช้ฟังก์ชันประมวลผลข้อมูลตามจังหวัดสำหรับ Superadmin
      
        
        // สร้างกราฟหลังจากประมวลผลข้อมูลเสร็จ
        this.createChart();
        this.createDonutChart();
        this.createMonthlyChart();  // เรียกใช้งานฟังก์ชันเพื่อสร้างกราฟตามเดือน
        this.dtTrigger.next(this.provinces);
      };

      // ใช้ service เดียวกัน แต่แยกตาม role โดยใช้ getter
      this.sv.getAllRecordsLinkedByEmployeeId().subscribe(
        recordData => {
          if (recordData && recordData.length > 0) {
            loadDocuments(recordData);
            console.log(recordData);
          } else {
            console.error('ไม่พบเอกสาร');
          }
        },
        error => {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        }
      );
    } else {
      console.error('User ID is undefined or null.');
    }
  },
  error => {
    console.error('Error fetching user profile:', error);
  }
);
}

}
