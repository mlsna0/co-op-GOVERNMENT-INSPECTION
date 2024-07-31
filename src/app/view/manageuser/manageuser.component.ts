import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';


@Component({
  selector: 'app-manageuser',
  templateUrl: './manageuser.component.html',
  styleUrls: ['./manageuser.component.css']
})
export class ManageuserComponent implements OnInit {

  user: any[] = [];
  dtOptions: any ={}; //datatable.setting ={}
  dtTrigger: Subject<any> = new Subject();
  loading: boolean = true;
  error: string = '';
 
  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
    private ls: loginservice,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[0, 'desc']],
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
    this.ls.getUserReport().subscribe(([registerData, userData]) => {
      this.user = this.mergeUserData(registerData, userData);
      this.loading = false;
    }, error => {
      console.error('Error fetching user data:', error);
      this.loading = false;
    });
  }

  mergeUserData(registerData: any[], userData: any[]): any[] {
    return registerData.map(regUser => {
      const user = userData.find(u => u.id === regUser.id); // แก้ไขให้ตรงกับ key ที่ใช้เชื่อมโยง
      return {
        firstname: regUser.firstname,
        lastname: regUser.lastname,
        email: regUser.email,
        role: user ? user.role : 'N/A' // หากไม่พบข้อมูล role
      };
    });
  }
  getUserReportProfile(id:any) {
    
    this.router.navigate(['/profilereport']);
  }

  onRoleChange(user: any) {
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
  }

 


}
