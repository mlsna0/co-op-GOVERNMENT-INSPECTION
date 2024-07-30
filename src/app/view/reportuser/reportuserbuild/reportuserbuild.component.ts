import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';

@Component({
  selector: 'app-reportuserbuild',
  templateUrl: './reportuserbuild.component.html',
  styleUrls: ['./reportuserbuild.component.css']
})
export class ReportuserbuildComponent implements OnInit {

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
    private authService: AuthService
  ) { }

  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get isSuperAdmin(): boolean {
    return this.authService.hasRole('superadmin');
  }

  get isUser(): boolean {
    return this.authService.hasRole('user');
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
    this.ls.getUserReport().subscribe(
      data => {
        this.user = data;
        this.loading = false;
      },
      err => {
        this.error = 'Failed to load data';
        this.loading = false;
      }
    );
  }
  getUserReportProfile(id:any) {
    
    this.router.navigate(['/profilereport']);
  }
}

