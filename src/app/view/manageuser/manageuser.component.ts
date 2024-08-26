import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { SharedService } from 'app/services/shared.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-manageuser',
  templateUrl: './manageuser.component.html',
  styleUrls: ['./manageuser.component.css']
})
export class ManageuserComponent implements OnInit {

  user: any[] = [];
  dtOptions: any = {}; // datatable.setting = {}
  dtTrigger: Subject<any> = new Subject();
  loading: boolean = true;
  error: string = '';
  exportCounter: any;

  constructor(
    private http: HttpClient,
    private ls: loginservice,
    private sv: SharedService,
    private router: Router,
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
    this.ls.getUserReport().subscribe(data => {
      this.user = this.mergeUserData(data.employees, data.users);
      console.log("status: ",this.user)
      this.loading = false;
    }, error => {
      console.error('Error fetching user data:', error);
      this.loading = false;
    });
  }

  mergeUserData(registerData: any[], userData: any[]): any[] {
    return registerData.map(regUser => {
      const user = userData.find(u => u.employeeId === regUser._id); // ตรวจสอบให้แน่ใจว่าใช้ key ที่ถูกต้อง
      return {
        id: user ? user._id : null, // ใช้ ID ของ `user` แทน `employee`
        firstname: regUser.firstname,
        lastname: regUser.lastname,
        email: regUser.email,
        role: user ? user.role : 'N/A', // หากไม่พบข้อมูล role
        isActive: user ? user.isActive : false
      };
    });
  }

  // getUserReportProfile(id: any) {
  //   this.router.navigate([`/profileuser/${id}`]).catch(err => {
  //     console.error('Navigation Error:', err);
  //   });
  //   console.log('id',id)
  // }

      getUserReportProfile(userId: any) {
    this.router.navigate(['/profileuser', userId]);
    }



  onRoleChange(user: any) {
    console.log('User ID:', user.id); // เพิ่มบรรทัดนี้เพื่อตรวจสอบค่า user.id
    if (user.id) { // ตรวจสอบว่ามี user.id ก่อนทำการอัปเดต
      this.ls.updateUserRole(user.id, user.role).subscribe(
        (response) => {
          console.log('Role updated successfully:', response);
          // Optionally show a success message to the user
        },
        (error) => {
          console.error('Error updating role:', error);
          // Optionally show an error message to the user
        }
      );
    } else {
      console.error('User ID is missing');
      // Optionally show an error message to the user
    }
  }

    updateUserStatus(user: any) {
    
      console.log('User ID status:', user.id); 
      console.log('user.isActive status:',user.isActive)
      if(user.id){
        this.sv.updateUserStatus(user.id,user.isActive).subscribe(response =>{
          console.log('Status updated successfully:', response);
        })
      }
    }

    exportToExcel(): void {
      // กำหนดข้อมูลตามลำดับคอลัมน์ที่ต้องการ
      const exportData = this.user.map((users, index) => ({
        'ลำดับ': index + 1,
        'ชื่อ': users.firstname,
        'นามสกุล': users.lastname,
        'อีเมล': users.email,
        'ระดับผู้ใช้งาน': users.role,
        'สถานะผู้ใช้งาน': users.isActive ? 'Active' : 'Inactive',
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
  openaddperson() {
    this.router.navigate(['/addperson']);
  }
}

