import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { loginservice } from 'app/layouts/login.services.';
import { SharedService } from "../../../services/shared.service";
import { AuthService } from "../../../layouts/auth-layout/auth-layout.Service"
import Swal from 'sweetalert2';
import $ from "jquery";
import 'bootstrap';
import { first } from 'rxjs';
import { ProvinceService } from 'app/view/thaicounty/thaicounty.service';


@Component({
  selector: 'app-profileuser',
  templateUrl: './profileuser.component.html',
  styleUrls: ['./profileuser.component.css']
})
export class ProfileuserComponent implements OnInit {

  UserData:any ={};
  UserID:any;
  EmployeeID:any;
  UserInfoForm:FormGroup;


  PersonINT:any=0;
  EditStatus: boolean=false;

  profileImgUrl:string;

  provinces: any[] = [];  // ตัวแปรสำหรับเก็บข้อมูลจังหวัด
  amphures: any[] = [];   // ตัวแปรสำหรับเก็บข้อมูลอำเภอ
  tambons: any[] = [];    // ตัวแปรสำหรับเก็บข้อมูลตำบล


  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private authService: AuthService,
    private loginSV:loginservice,
    private router: Router,
    private ACrouter :ActivatedRoute,
    private ts: ProvinceService,
  ) { 

    this.UserInfoForm = this.fb.group({
      firstname: ["" ],
      lastname: [""],
      email: ["",  Validators.email],
      // password: ["", Validators.minLength(8)],
      // confirmpassword: ["", Validators.minLength(8)],
      organization:['', ],
      address:["", ],
      // phone: ["", Validators.pattern('^[0-9]{10}$')],
      province: ['' ],
      amphure: ['' ],
      tambon: ['' ],
      postCode: [''],
      // role: ['' ],
      profileImage: [null]
  })
  }


  ngOnInit(): void {
    // this.loginSV.getUserProfile().subscribe(
    //   res => {
    //   this.UserData = res;
    //   console.log("onInit get UserData: ", this.UserData);
    //   this.UserInfoForm.patchValue(this.UserData);
    // });

    this.ACrouter.paramMap.subscribe(params => {
      this.UserID = params.get('id');

      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log("UserID it send? >",this.UserID); // ทดสอบการดึงค่า id
  
    });

    this.sv.getUserProfileById(this.UserID).subscribe(res =>{
      this.UserData = res;
      console.log("get UserDataById : ",this.UserData),
      this.UserInfoForm.patchValue({
        firstname: this.UserData?.employeeId.firstname,
        lastname: this.UserData?.employeeId.lastname,
        email: this.UserData?.employeeId.email,
        // email: this.UserData?.email,
        // password: ["", Validators.minLength(8)],
        // confirmpassword: ["", Validators.minLength(8)],
        organization: this.UserData?.employeeId.organization,
        address:this.UserData?.employeeId.address,
        // phone: ["", Validators.pattern('^[0-9]{10}$')],
        province:this.UserData?.employeeId.province,
        amphure: this.UserData?.employeeId.amphure,
        tambon: this.UserData?.employeeId.tambon,
        postCode: this.UserData?.employeeId.postCode,
        // // role: ['' ],
        // profileImage: [null]
      })
    })
    this.sv.currentProfileImageUrl.subscribe(url=> this.profileImgUrl= url);

    this.ts.getProvincesWithDetails().subscribe(data => {
      this.provinces = data;
      this.amphures = data.flatMap(province => province.amphures);
      this.tambons = this.amphures.flatMap(amphure => amphure.tambons);
  
      // ตรวจสอบข้อมูลที่โหลดมา
      // console.log('Provinces:', this.provinces);
      // console.log('Amphures:', this.amphures);
      // console.log('Tambons:', this.tambons);

    });
  }

 // Method to get province name from id
 getProvinceName(id: number): string {
  // ตรวจสอบประเภทของ id และแปลงให้ตรงกันถ้าจำเป็น
  const provinceId = Number(id);
  // ตรวจสอบข้อมูลใน provinces
  // console.log('All Provinces:', this.provinces);
  const province = this.provinces.find(p => p.id === provinceId);
  // console.log(`Searching for Province ID: ${provinceId}. Found:`, province);
  return province ? province.name_th : 'Not Found';
}
  
  // Method to get amphure name from id
  getAmphureName(id: number): string {
    // console.log('All Amphures:', this.amphures);
    // แปลง id เป็น number เพื่อให้ตรงกับข้อมูลใน array
    const amphureId = Number(id);
    const amphure = this.amphures.find(a => a.id === amphureId);
    // console.log(`Searching for Amphure ID: ${amphureId}. Found:`, amphure);
    return amphure ? amphure.name_th : 'Not Found';
  }
  
  getTambonName(id: number): string {
    // console.log('All Tambons:', this.tambons);
    // แปลง id เป็น number เพื่อให้ตรงกับข้อมูลใน array
    const tambonId = Number(id);
    const tambon = this.tambons.find(t => t.id === tambonId);
    // console.log(`Searching for Tambon ID: ${tambonId}. Found:`, tambon);
    return tambon ? tambon.name_th : 'Not Found';
  } 



  BackRoot(){
    this.router.navigate(['/manageuser']);
  }
  editProfile() {
    // Add your edit profile logic here
    this.EditStatus= true;
    this.PersonINT++;
    // console.log('Edit profile clicked',this.PersonINT);
  }

  SaveUserInfo() {
    if (this.UserInfoForm.valid) {
      const updatedData = this.UserInfoForm.value;
      const userId = this.UserID;
      console.log("user id save into",userId)
      this.sv.updateUserProfileById(updatedData, userId).subscribe(response => {
        console.log('Response:', response);
  
        if (response && response.user) {
          if (response?.user?.employeeId && response?.user?.employeeId?.firstname) {
            this.UserData = response;
            this.EditStatus = false;
          } else {
            console.error('Firstname not found in user data');
          }
        } else {
          console.error('Unexpected response format', response);
        }
      });
    }
  }
  
  
  
  cancelEdit(){
    this.EditStatus= false;
  }
  
}