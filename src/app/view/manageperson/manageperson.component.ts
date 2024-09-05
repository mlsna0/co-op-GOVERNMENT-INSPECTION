import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';

import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { SharedService } from 'app/services/shared.service';
import { loginservice } from 'app/layouts/login.services.';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manageperson',
  templateUrl: './manageperson.component.html',
  styleUrls: ['./manageperson.component.css']
})
export class ManagepersonComponent implements OnInit {

  loading:boolean = false;
  dtOptions: any ={};

  dataPerson: any[] = [];
  UserData:any ={};
  DataOrganization:any ={};

  UserID:any;
  OrganizationID:any;
  selectedOrganizationID:any;
  

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private ts :ProvinceService,
    private sv: SharedService, 
    private loginSV:loginservice,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.dtOptions = {
      order: [0, 'asc'],
      pagingType: 'full_numbers',
      language: {
        lengthMenu: "แสดง _MENU_ รายการ",
        search: "ค้นหา",
        info: "แสดงหน้า _PAGE_ จากทั้งหมด _PAGES_ หน้า",
        infoEmpty: "แสดง 0 ของ 0 รายการ",
        zeroRecords: "ไม่พบข้อมูล",
        paginate: {
          first: "หน้าแรก",
          last: "หน้าสุดท้าย",
          next: "ต่อไป",
          previous: "ย้อนกลับ"
        },
      }
    };
    this.loginSV.getUserProfile().subscribe(
      res => {
        console.log("UserData received:", res);
        this.UserData = res;

        this.UserID = this.UserData?._id;
        this.OrganizationID = this.UserData?.employeeId?.agencies;
        this.selectedOrganizationID = this.OrganizationID[0]; 
        // console.log( " this.OrganizationID > ",this.OrganizationID)
        console.log("Selected Organization ID:", this.selectedOrganizationID);
        // console.log("UserID it send? >",this.UserID);
        // console.log("ProfileImage from UserData:", this.UserData?.employeeId?.profileImage);
        // this.previousFile =  this.UserData?.employeeId?.profileImage
        // this.imageSrc = this.previousFile ? this.UserData?.employeeId?.profileImage : null;

     

        //Organization info
        this.sv.getOrganizationById(this.selectedOrganizationID).subscribe(res=>{
          this.DataOrganization = res;
          // console.log("Data of Organiz: ",this.DataOrganization)
        });
        this.sv.getPersonsWithSameOrganization(this.selectedOrganizationID).subscribe(res => {
          this.dataPerson = res;
          this.loading = false; // เมื่อข้อมูลถูกโหลดแล้ว ให้สถานะเป็น false
          console.log("Data of person:", this.dataPerson);
        }, error => {
          this.loading = false; // ในกรณีเกิดข้อผิดพลาด ให้ทำสถานะเป็น false ด้วย
          console.error('Error fetching persons:', error);
        });
      
     
      },
      error => {
        console.error('Error fetching user profile:', error);
      },

 
    );




  }

}
