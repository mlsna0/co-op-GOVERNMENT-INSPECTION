import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { SharedService } from 'app/services/shared.service';
import { FormBuilder, Validators } from '@angular/forms';


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
  //   this.ls.getUserById().subscribe(
  //     userIdData => {
  //       const userId = userIdData.id; // Adjust according to your response structure

  //       this.sv.getRecordWithUserAndEmployee(userId).subscribe(
  //         data => {
  //           this.user = this.mergeUserData(data.record, data.users, data.employees);
  //           console.log('Record:', data.record);
  //           console.log('Users:', data.users);
  //           console.log('Employees:', data.employees);
  //           this.loading = false;
  //         },
  //         error => {
  //           console.error('Error fetching user data:', error);
  //           this.error = error;
  //           this.loading = false;
  //         }
  //       );
  //     },
  //     error => {
  //       console.error('Error fetching user ID:', error);
  //       this.error = 'Error fetching user ID';
  //       this.loading = false;
  //     }
  //   );
  // }
  

  

  // mergeUserData(record: any[], users: any[], employees: any[]): any[] {
  //   console.log(record)
  //   console.log(users)
  //   console.log(employees)

  //   return record.map(record => {
  //     // Find the user that matches the userId from the record
  //     const user = users.find(u => u._id === record.userId);
  
  //     // Find the employee that matches the employeeId from the user
  //     const employee = user ? employees.find(e => e._id === user.employeeId) : null;
  
  //     return {
  //       ...record,
  //       user: user || null,        // Add user info to record
  //       employee: employee || null // Add employee info to record if needed
  //     };
  //   });
  }

  getUserReportProfile(id: any) {
    this.router.navigate(['/profilereport']);
  }
}

