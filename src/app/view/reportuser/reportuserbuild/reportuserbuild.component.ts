import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { SharedService } from 'app/services/shared.service';
import { FormBuilder } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reportuserbuild',
  templateUrl: './reportuserbuild.component.html',
  styleUrls: ['./reportuserbuild.component.css']
})
export class ReportuserbuildComponent implements OnInit {

  userDocuments: any[] = [];
  dtOptions: any = {}; // datatable settings
  dtTrigger: Subject<any> = new Subject();
  loading: boolean = true;
  error: string = '';
  exportCounter: number = 1;  // ตัวนับเริ่มที่ 1

  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
    private ls: loginservice,
    private router: Router,
    private authService: AuthService,
    private sv: SharedService,
    private fb: FormBuilder,
  ) {}

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
      this.userDocuments = this.transformData(data).reverse();
      this.loading = false;
    }, error => {
      console.error('Error fetching user data:', error);
      this.loading = false;
    });
  }

  transformData(data: any[]): any[] {
    return data.flatMap(item => {
      const employee = item.employee || { firstname: 'N/A', lastname: 'N/A', email: 'N/A' };
      return item.documents.map(doc => ({
        documentId: doc._id,
        record_topic: doc.record_topic,
        createdDate: doc.createdDate,
        createdTime: doc.createdTime,
        firstname: employee.firstname,
        lastname: employee.lastname,
        email: employee.email,
        role: item.user.role || 'N/A'
      }));
    });
  }

  getUserReportProfile(id: any) {
    this.router.navigate(['/profilereport']);
  }

  exportToExcel(): void {
    const exportData = this.userDocuments.map((doc, index) => ({
      'ลำดับ': index + 1,
      'หัวข้อ': doc.record_topic,
      'ชื่อ': doc.firstname,
      'นามสกุล': doc.lastname,
      'วันที่สร้าง': doc.createdDate,
      'เวลาที่สร้าง': doc.createdTime
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ReportUserBuild');

    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const fileName = `UserReport${this.exportCounter}.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

    this.exportCounter++;
  }
}