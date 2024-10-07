import { Component, OnInit,Input, OnChanges, SimpleChanges, ViewChild  } from '@angular/core';
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
import { DataTableDirective } from 'angular-datatables';

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
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective; // ประกาศ dtElement เพื่อเชื่อมโยงกับ DataTable
 
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


  groupProvincesData:any[] =[];
  filteredProvincesData: any[] = []; // ข้อมูลที่กรองแล้ว
  originalData: any[] = []; // เก็บข้อมูลต้นฉบับ
  
  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
    private sv:SharedService,
    private loginservice: loginservice, 
    private documentService: DocumentService
  ) { 
  }

  ngOnInit(): void {
    this.loading = true;
    this.dtOptions = {
      order: [[1, 'desc']],
      pagingType: 'full_numbers',
      columns: [
        { title: 'จังหวัด', data: 'provinceName' },
        { title: 'จำนวนหน่วยงาน', data: 'agenciesCount' },
        { title: 'จำนวนเอกสาร', data: 'documentCount' },
        { title: 'จำนวนเอกสารที่ลงนามแล้ว', data: 'signedCount' },
        { title: 'จำนวนเอกสารดำเนินงาน', data: 'onProcessCount' },
        { title: 'เปอร์เซ็นต์', data: 'percentage' }
      ],
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
      console.log("this.provinces",this.provinces)
    
      this.dtTrigger.next(this.provinces);
      this.loading = false;
    });
    // this.loadPDFs()
    this.loadUserReportNew();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterCriteria']) {
      if (this.filterCriteria) {
        // ตรวจสอบว่ามีค่า refresh ใน filterCriteria หรือไม่
        if (this.filterCriteria.refresh) {
          // ถ้าเป็นการรีเฟรช ให้รีเซ็ตข้อมูลทั้งหมด
          this.resetData();
        } else {
          // ถ้าไม่ใช่การรีเฟรช ให้ทำการกรองข้อมูลตาม filterCriteria
          this.applyFilter();
        }
      }
    }
  }
  



  applyFilter() {
    // ถ้ามี filterCriteria ให้ทำการกรอง
    if (this.filterCriteria) {
      this.filterProvinces();
    }
  
    // ตรวจสอบว่ามีการเลือกจังหวัดหรือไม่
    if (this.filterCriteria && this.filterCriteria.selectedProvinces && this.filterCriteria.selectedProvinces.length > 0) {
      const selectedIds = this.filterCriteria.selectedProvinces.map(id => id.toString()); // แปลงเป็น string
      console.log("รหัสจังหวัดที่เลือก: ", selectedIds);
  
      // กรองข้อมูลตามจังหวัดที่เลือก
      this.filteredProvincesData = this.groupProvincesData.filter(provinceData => {
        const isIncluded = selectedIds.includes(provinceData.province.toString());
        return isIncluded;
      });
    } else {
      // ถ้าไม่มีการเลือกจังหวัด ให้แสดงข้อมูลทั้งหมด (รีเซ็ต)
      this.filteredProvincesData = [...this.groupProvincesData];
    }
  
    console.log("ข้อมูลจังหวัดที่กรองแล้ว: ", this.filteredProvincesData);
    
    // อัปเดต DataTable โดยไม่ทำลาย instance
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear(); // ลบข้อมูลเก่าใน DataTable
      dtInstance.rows.add(this.filteredProvincesData); // เพิ่มข้อมูลใหม่ (กรองแล้วหรือทั้งหมด)
      dtInstance.draw(); // วาดใหม่เพื่อแสดงข้อมูลที่กรองแล้วหรือทั้งหมด
    });
  }

  resetData() {
    // ฟังก์ชันสำหรับโหลดข้อมูลทั้งหมดใหม่
    this.filteredProvincesData = [...this.groupProvincesData]; // รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นทั้งหมด
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear(); 
      dtInstance.rows.add(this.filteredProvincesData); 
      dtInstance.draw(); 
    });
  }
  
  filterProvinces() {
    // กรอง provinces ตาม filterCriteria
    if (this.filterCriteria && this.filterCriteria.selectedProvinces) {
      const selectedIds = this.filterCriteria.selectedProvinces; // Get selected province IDs
  
      // ใช้ฟังก์ชัน filter เพื่อลดจำนวน provinces
      this.provinces = this.provinces.filter(province => selectedIds.includes(province.id));
      console.log(" filterProvinces: ",this.provinces)
      // อัปเดต DataTable ด้วยข้อมูลที่กรองแล้ว
      this.dtTrigger.next(this.provinces);
    }
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  loadUserReport(): void {
    // console.log('Starting to load user report...');
    this.sv.getAllRecordsLinkedByEmployeeId().subscribe(
        recordData => {
            console.log('API response received:', recordData);
            if (recordData && recordData.length > 0) {
                this.allDocuments = recordData;

                const provinceData: { [provinceName: string]: { users: any[], documentCount: number, signedDocuments: number } } = {};

                this.totalDocuments = 0;
                this.totalSignedDocuments = 0;

                this.allDocuments.forEach(data => {
                    data.documentCount = data.documents.length;
                    const provinceStr =  data.agency?.province;
                
                    const provinceId = parseInt(provinceStr, 10);
                    const provinceName = this.provinceService.getProvinceNameById(provinceId, this.provinces);
                    // console.log("ชือ่จังหวัด: " ,provinceName) ;
                    if (!provinceName || provinceName === 'ไม่ทราบจังหวัด') {
                        console.warn(`Skipping user with unknown province (Province ID: ${provinceId})`);
                        return;
                    }

                    if (!provinceData[provinceName]) {
                        provinceData[provinceName] = { users: [], documentCount: 0, signedDocuments: 0 };
                    }
                    provinceData[provinceName].users.push(data);
                    provinceData[provinceName].documentCount += data.documentCount;

                    // เปรียบเทียบชื่อ documentId กับชื่อ PDF
                    data.documents.forEach(document => {
                      if (!document._id) {
                        // console.warn('พบเอกสารที่ไม่มี _id, ข้าม:', doc);
                        return; // ข้ามเอกสารที่ไม่มี _id
                      }
                        if (this.pdfs.includes(`${document._id}.pdf`)) {
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

loadUserReportNew() {
  // ตั้งค่าสถานะการโหลดเป็น true ก่อนเริ่มการเรียก API
  this.loading = true;

  this.sv.getAllRecordsWithEmployees().subscribe(
    res => {
      // เก็บผลลัพธ์จาก API
      console.log("thaicountry getAllRecordsWithEmployees: ",res)
      this.groupProvincesData = res;

      // สร้างแผนที่ของชื่อจังหวัดจาก provinces
      const provinceMap = new Map(this.provinces.map(province => [province.id.toString(), province.name_th]));

      // สร้างอาร์เรย์ใหม่ที่เก็บข้อมูลของทั้ง 77 จังหวัด
      const fullProvinceData = this.provinces.map(province => {
        const foundProvince = this.groupProvincesData.find(group => group.province.toString() === province.id.toString());

        if (foundProvince) {
          const totalDocuments = foundProvince.documentCount || 0; // จำนวนเอกสารทั้งหมด
          const signedDocuments = foundProvince.signedCount || 0; // จำนวนเอกสารที่เซ็น

          // คำนวณเปอร์เซ็นต์
          const percentage = totalDocuments > 0 ? (signedDocuments / totalDocuments) * 100 : 0;

          return {
            ...foundProvince,
            provinceName: province.name_th,
            percentage: percentage,
            
          };
        } else {
          return {
            province: province.id,
            provinceName: province.name_th,
            agenciesCount: 0, 
            documentCount: 0,
            signedCount: 0,
            onProcessCount: 0, 
            percentage: 0,
          };
          
        }
      
      });

      // เก็บข้อมูลเต็ม 77 จังหวัดกลับใน groupProvincesData
      this.groupProvincesData = fullProvinceData;

      // เก็บข้อมูลต้นฉบับไว้เพื่อใช้ในการกรองข้อมูล
      this.originalData = [...fullProvinceData];

      // Debugging: ตรวจสอบข้อมูลที่จะถูกส่งไปยัง DataTable
      console.log('Data to be sent to DataTable: ', this.groupProvincesData);

      // อัปเดต DataTable
      this.dtTrigger.next(this.groupProvincesData);

      // Debugging: ตรวจสอบว่า DataTable ถูกอัปเดตแล้ว
      console.log('DataTable updated.');

      // เรียกใช้ applyFilter หลังจากโหลดข้อมูลเพื่อกรองข้อมูลที่แสดง
      if (this.filterCriteria) {
        console.log('Applying filter: ', this.filterCriteria);
        this.applyFilter();
      }

      // หยุดสถานะการโหลดเมื่อข้อมูลเสร็จสมบูรณ์
      this.loading = false;
    },
    error => {
      // จัดการข้อผิดพลาดในการโหลดข้อมูล
      console.error('Error loading data: ', error);

      // หยุดสถานะการโหลดในกรณีที่เกิดข้อผิดพลาด
      this.loading = false;
    }
  );
}
exportToExcel(): void {
  // กำหนดข้อมูลตามลำดับคอลัมน์ที่ต้องการ
  // const exportData = this.provinces.map((province, index) => ({
  //   'ลำดับ': index + 1,
  //   'จังหวัด': province.name_th,
  //   'จำนวนเอกสาร': province.count,
  //   'จำนวนเอกสารที่ถูกเซ็น': province.signedDocuments,
  //   'เปอร์เซ็นต์': province.percentage.toFixed(2) + '%',
  // }));
  const exportData = this.groupProvincesData.map((groupProvincesData, index) => ({
    'ลำดับ': index + 1,
    'จังหวัด':  groupProvincesData?.provinceName,
    'จำนวนหน่วยงาน':groupProvincesData?.agenciesCount,
    'จำนวนเอกสาร': groupProvincesData?.documentCount,
    'จำนวนเอกสารที่ถูกเซ็น':  groupProvincesData?.signedCount,
    'จำนวนเอกสารดำเนินงาน':  groupProvincesData?.onProcessCount,
    'เปอร์เซ็นต์': groupProvincesData.percentage.toFixed(2) + '%',
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