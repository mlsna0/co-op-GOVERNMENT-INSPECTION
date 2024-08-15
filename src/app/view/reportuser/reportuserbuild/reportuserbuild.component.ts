import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { SharedService } from 'app/services/shared.service';
import { FormBuilder, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-reportuserbuild',
  templateUrl: './reportuserbuild.component.html',
  styleUrls: ['./reportuserbuild.component.css']
})
export class ReportuserbuildComponent implements OnInit {

  record: any[] =[];
  user: any[] =[];
 
  dtOptions: any ={}; //datatable.setting ={}
  dtTrigger: Subject<any> = new Subject();
  loading: boolean = true;
  error: string = '';

  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
    private ls: loginservice,
    private router: Router,
    private authService: AuthService,
    private sv: SharedService,
    private fb:FormBuilder,
  ) { 
    
   
  }



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
    
    this.sv.getallRecordWithUserAndEmployee().subscribe(data => {
      this.user = this.mergeUserData(data.employees, data.users, data.documents);
      this.loading = false;
    }, error => {
      console.error('Error fetching user data:', error);
      this.loading = false;
    });

  }

  mergeUserData(registerData: any[], userData: any[], documentData: any): any[] {
    return documentData.map(document => {
      // หาผู้ใช้ที่ตรงกับ userId ใน document
      const user = userData.find(u => u._id === document.userId);
      
      // หากพบผู้ใช้ใน userData, หาพนักงานที่ตรงกับ employeeId ใน user
      const employee = user ? registerData.find(e => e._id === user.employeeId) : null;
  
      return {
        documentId: document._id,
        record_topic:document.record_topic ,
        createdDate:document.createdDate ,
        createdTime:document.createdTime ,
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
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.user);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'User Report');

    // สร้างไฟล์ Excel
    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // ดาวน์โหลดไฟล์
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'UserReport.xlsx');
  }
}

