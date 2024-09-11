import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SharedService } from 'app/services/shared.service';
import { loginservice } from 'app/layouts/login.services.';

@Component({
  selector: 'app-agency-member',
  templateUrl: './agency-member.component.html',
  styleUrls: ['./agency-member.component.css']
})
export class AgencyMemberComponent implements OnInit {

  UserID: any; //get ID from manage User 
  OrganizationID:any;
  selectedOrganizationID:any;

  dataPerson: any[] = [];
  UserData:any ={};
  DataOrganization:any ={};


  loading:boolean = false; //for laoding data and stop loading
  dtOptions: any ={};
  constructor(
    private router: Router,
    private ACrouter :ActivatedRoute,
    private sv: SharedService, 
    private loginSV:loginservice,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.dtOptions = {
      order: [0],
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



    //ใช้รับค่าจาก หน้า manageUser
    this.ACrouter.paramMap.subscribe(params => {
      this.UserID = params.get('id');

      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log("UserID it send? >",this.UserID); // ทดสอบการดึงค่า id
      // this.loading =false;
  
    });

    this.sv.getUserProfileById(this.UserID).subscribe(res=>{
      this.UserData =res;

      console.log("user data : ",this.UserData)
      this.OrganizationID = this.UserData?.employeeId?.agencies;
      this.selectedOrganizationID = this.OrganizationID[0]; 
      console.log("this.selectedOrganizationID : ",this.selectedOrganizationID)

      // this.sv.getOrganizationById(this.selectedOrganizationID).subscribe(res=>{
      //   this.DataOrganization = res;
      //   // console.log("Data of Organiz: ",this.DataOrganization)
      // });
      this.sv.getPersonsWithSameOrganization(this.selectedOrganizationID).subscribe(res => {
        this.dataPerson = res;
        this.loading = false; // เมื่อข้อมูลถูกโหลดแล้ว ให้สถานะเป็น false
        console.log("Data of person:", this.dataPerson);
      }, error => {
        this.loading = false; // ในกรณีเกิดข้อผิดพลาด ให้ทำสถานะเป็น false ด้วย
        console.error('Error fetching persons:', error);
      });
    })



       //Organization info
 



  }

  openAddPersonModal(){
    $('#memberModel').modal({
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    $('#memberModel').modal('show');

  }

}
