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
    private ts: ProvinceService,
  ) { 

    this.UserInfoForm = this.fb.group({
      firstname:[''],
      lastname:[''],
      bearing: [''], // Add this ตำแหน่งหน้าที่
      company: [''], // Add this องค์กร
      address:[''],
      province: [''],
      country: [''],
      postalCode: [''],
  })
  }


  ngOnInit(): void {
    this.loginSV.getUserProfile().subscribe(
      res => {
      this.UserData = res;
      // console.log("onInit get UserData: ", this.UserData);
      this.profileImgUrl = this.UserData.profileImageUrl || 'path_to_default_image'; // ใช้รูป default ถ้าไม่มีรูปโปรไฟล์
      this.UserInfoForm.patchValue(this.UserData);
    });
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




  editProfile() {
    // Add your edit profile logic here
    this.EditStatus= true;
    this.PersonINT++;
    // console.log('Edit profile clicked',this.PersonINT);
  }

  SaveUserInfo(){
    if (this.UserInfoForm.valid) {
      const updatedData = this.UserInfoForm.value;
      // ส่งข้อมูลที่แก้ไขแล้วไปยังเซิร์ฟเวอร์
      this.sv.updateUserProfile(updatedData).subscribe(response => {
        this.UserData = response;
        console.log('UserData', this.UserData)
        this.EditStatus = false;
      });
    }

  }
  cancelEdit(){
    this.EditStatus= false;
  }
  
}