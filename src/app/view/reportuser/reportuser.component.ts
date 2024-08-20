  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Subject } from 'rxjs';
  import { loginservice } from 'app/layouts/login.services.';
  import { Router } from '@angular/router';
  import { SharedService } from 'app/services/shared.service';
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';

  @Component({
    selector: 'app-reportuser',
    templateUrl: './reportuser.component.html',
    styleUrls: ['./reportuser.component.css']
  })
  export class ReportuserComponent implements OnInit {
    user: any[] = [];
    dtOptions: any = {}; // datatable.setting = {}
    dtTrigger: Subject<any> = new Subject();
    loading: boolean = true;
    error: string = '';

    exportCounter: number = 1;  // ตัวนับเริ่มที่ 1
    constructor(
      private http: HttpClient,
      private ls: loginservice,
      private router: Router,
      private sv:SharedService,
    ) { }

    ngOnInit(): void {
      this.dtOptions = {
        order: [[0, 'asc']],
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
      // this.sv.getallRecordWithUserAndEmployee().subscribe((data: any[]) => {
      //   const { employees, users, documents } = data;
      //   this.user = this.mergeUserData(employees, users, documents);
      //   this.loading = false;
      // }, error => {
      //   console.error('Error fetching user data:', error);
      //   this.loading = false;
      // });

      this.sv.getLoginTime().subscribe(data => {
        this.user = this.mergeUserData(data.employees, data.users, data.timestamp).reverse(); // กลับลำดับข้อมูล
        this.loading = false;
      }, error => {
        console.error('Error fetching user data:', error);
        this.loading = false;
      });
    }

    mergeUserData(registerData: any[], userData: any[], timestampData: any[]): any[] {
      return timestampData.map(timestamp => {
        // หาผู้ใช้ที่ตรงกับ userId ใน document
        const user = userData.find(u => u._id === timestamp.userId);
        
        // หากพบผู้ใช้ใน userData, หาพนักงานที่ตรงกับ employeeId ใน user
        const employee = user ? registerData.find(e => e._id === user.employeeId) : null;
    
        return {
          timestampId: timestamp._id,   
          date: timestamp.date,
          time: timestamp.time,
          firstname: employee ? employee.firstname : 'N/A',
          lastname: employee ? employee.lastname : 'N/A',
          email: employee ? employee.email : 'N/A',
          role: user ? user.role : 'N/A'

        };
      });
      
    }

    getUserReportProfile(id: any) {
      this.router.navigate(['/profilereport']);
    }
    exportToExcel(): void {
      // กำหนดข้อมูลตามลำดับคอลัมน์ที่ต้องการ
      const exportData = this.user.map((users, index) => ({
        'ลำดับ': index + 1,
        'ชื่อ': users.firstname,
        'อีเมล': users.email,
        'ระดับผู้ใช้งาน': users.role,
        'วันที่เข้าใช้งาน': users.date,
        'เวลาที่เข้าใช้งาน': users.time,
      }));
    
      // สร้างแผ่นงาน (worksheet) จากข้อมูลที่จัดเรียงแล้ว
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    
      // สร้างหนังสือ (workbook) ใหม่
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ReportUser');
    
      // สร้างไฟล์ Excel
      const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
      const fileName = `UserReport${this.exportCounter}.xlsx`;
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  
      // เพิ่มตัวนับ
      this.exportCounter++;
    }
   
  }
