import { Component, OnInit,Input, OnChanges, SimpleChanges  } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { SharedService } from "app/services/shared.service";
import { loginservice } from 'app/layouts/login.services.';
import { DocumentService } from 'app/services/document.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// import 'datatables.net';
// import 'datatables.net-dt/css/jquery.dataTables.css';
import * as $ from 'jquery';
import { forkJoin } from 'rxjs';

interface Province {
  signedDocuments: number;
  name_th: any;
  id: number;  // เพิ่มฟิลด์ id
  name: string;
  count: number;
  percentage: number;
}


@Component({
  selector: 'app-thaicounty',
  templateUrl: './thaicounty.component.html',
  styleUrls: ['./thaicounty.component.css']
})
export class ThaicountyComponent implements OnInit {
  totalDocuments: number = 0;
  totalSignedDocuments: number = 0;
  @Input() filterCriteria: any;
  pdfs: any[] = [];
  errorMessage: string | null = null;
  provinces: Province[] = [];
  allDocuments: any[] = []; 
  dtOptions: DataTables.Settings = {};
  dtTrigger: BehaviorSubject<any> = new BehaviorSubject([]); 
  loading: boolean = true;
  usersByProvince: { [provinceName: string]: any[] } = {};
  exportCounter: any;
  
  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
    private sv:SharedService,
    private loginservice: loginservice, 
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[1, 'desc']],
      pagingType: 'full_numbers',
      language: {
        lengthMenu: 'แสดง _MENU_ รายการ',
        search: 'ค้นหา',
        info: 'แสดงหน้า _PAGE_ จากทั้งหมด _PAGES_ หน้า',
        infoEmpty: 'แสดง 0 ของ 0 รายการ',
        zeroRecords: 'ไม่พบข้อมูล',

        paginate: {
          first: 'หน้าแรก',
          last: 'หน้าสุดท้าย',
          next: 'ต่อไป',
          previous: 'ย้อนกลับ'
        }
      }
    };

    this.provinceService.getProvinces().subscribe(data => {
     
      this.provinces = data; // เก็บข้อมูลจังหวัดทั้งหมดใน component
      this.loadUserReport();
      this.loading = false;
      this.dtTrigger.next(this.provinces);
    });
    this.loadPDFs()
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
  loadUserReport(): void {
    // console.log('Starting to load user report...');
    this.sv.getAllRecordsLinkedByEmployeeId().subscribe(
        recordData => {
            // console.log('API response received:', recordData);
            if (recordData && recordData.length > 0) {
                this.allDocuments = recordData;

                const provinceData: { [provinceName: string]: { users: any[], documentCount: number, signedDocuments: number } } = {};

                this.totalDocuments = 0;
                this.totalSignedDocuments = 0;

                this.allDocuments.forEach(user => {
                    user.documentCount = user.documents.length;

                    const provinceId = parseInt(user.employee.province, 10);
                    const provinceName = this.provinceService.getProvinceNameById(provinceId, this.provinces);

                    if (!provinceName || provinceName === 'ไม่ทราบจังหวัด') {
                        // console.warn(`Skipping user with unknown province (Province ID: ${provinceId})`);
                        return;
                    }

                    if (!provinceData[provinceName]) {
                        provinceData[provinceName] = { users: [], documentCount: 0, signedDocuments: 0 };
                    }
                    provinceData[provinceName].users.push(user);
                    provinceData[provinceName].documentCount += user.documentCount;

                    // เปรียบเทียบชื่อ documentId กับชื่อ PDF
                    user.documents.forEach(document => {
                        if (this.pdfs.some(pdf => pdf.name === document.documentId)) {
                            provinceData[provinceName].signedDocuments += 1;
                        }
                    });

                    // เพิ่มจำนวนเอกสารทั้งหมดและเอกสารที่ถูกเซ็นของแต่ละจังหวัดเข้ากับ totalDocuments และ totalSignedDocuments
                    this.totalDocuments += provinceData[provinceName].documentCount;
                    this.totalSignedDocuments += provinceData[provinceName].signedDocuments;
                });

                // ตั้งค่าเริ่มต้นให้ทุกจังหวัดมีจำนวนเอกสารเป็น 0
                this.provinces.forEach(province => {
                    province.count = 0;
                    province.signedDocuments = 0;
                    province.percentage = 0;
                });

                // อัพเดตข้อมูลจำนวนเอกสารใน provinces
                this.provinces.forEach(province => {
                    const provinceName = province.name_th;
                    if (provinceData[provinceName]) {
                        province.count = provinceData[provinceName].documentCount;
                        province.signedDocuments = provinceData[provinceName].signedDocuments;

                        // คำนวณเปอร์เซ็นต์ของเอกสารที่ถูกเซ็น
                        if (province.count > 0) {
                            province.percentage = (province.signedDocuments / province.count) * 100;
                        } else {
                            province.percentage = 0; // ถ้าไม่มีเอกสาร ก็จะเป็น 0%
                        }
                    }
                });

                // แสดงผลข้อมูลที่จัดกลุ่มแล้ว
                for (const [provinceName, data] of Object.entries(provinceData)) {
                    // console.log(`จังหวัด: ${provinceName}, จำนวนผู้ใช้: ${data.users.length}, จำนวนเอกสารทั้งหมด: ${data.documentCount}, จำนวนเอกสารที่ถูกเซ็น: ${data.signedDocuments}`);
                    // console.table(data.users.map(user => ({
                    //     'ชื่อผู้ใช้': `${user.employee.firstname} ${user.employee.lastname}`,
                    //     'จำนวนเอกสาร': user.documentCount,
                    //     'เอกสารที่ถูกเซ็น': provinceData[provinceName].signedDocuments
                    // })));
                }
             
                // อัพเดต DataTable
                this.dtTrigger.next(this.provinces);

            } else {
                console.error('ไม่พบเอกสาร');
            }
        },
        error => {
            console.error('Error loading records:', error);
        }
    );
}


loadPDFs(): void {
    this.sv.getAllPDFs().subscribe(
        data => {
            this.pdfs = data; // เก็บข้อมูล PDF ในตัวแปร this.pdfs
            // console.log('PDFs:', this.pdfs); // Log ข้อมูล PDF

            // เมื่อโหลด PDFs เสร็จแล้วเรียกใช้ loadUserReport
            this.loadUserReport();
        },
        error => {
            this.errorMessage = error; // จัดการกับข้อผิดพลาด
            // console.error('Error loading PDFs:', error);
        }
    );
}
exportToExcel(): void {
  // กำหนดข้อมูลตามลำดับคอลัมน์ที่ต้องการ
  const exportData = this.provinces.map((province, index) => ({
    'ลำดับ': index + 1,
    'จังหวัด': province.name_th,
    'จำนวนเอกสาร': province.count,
    'จำนวนเอกสารที่ถูกเซ็น': province.signedDocuments,
    'เปอร์เซ็นต์': province.percentage.toFixed(2) + '%',
  }));

  // สร้างแผ่นงาน (worksheet) จากข้อมูลที่จัดเรียงแล้ว
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

  // สร้างหนังสือ (workbook) ใหม่
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ReportDocuments');

  // สร้างไฟล์ Excel
  const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const fileName = `DocumentReport${this.exportCounter}.xlsx`;
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

  // เพิ่มตัวนับ
  this.exportCounter++;
}
}