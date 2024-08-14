import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { loginservice } from 'app/layouts/login.services.';
import { SharedService } from "../../services/shared.service";
import { AuthService } from "../../layouts/auth-layout/auth-layout.Service";
import { ProvinceService } from '../thaicounty/thaicounty.service';
import Swal from 'sweetalert2';
import $ from "jquery";
import 'bootstrap';
import { first } from 'rxjs';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  UserData:any ={};
  UserInfoForm:FormGroup;


  PersonINT:any=0;
  EditStatus: boolean=false;

  

  provinces: any[] = [];  // ตัวแปรสำหรับเก็บข้อมูลจังหวัด
  amphures: any[] = [];   // ตัวแปรสำหรับเก็บข้อมูลอำเภอ
  tambons: any[] = [];    // ตัวแปรสำหรับเก็บข้อมูลตำบล
  imgpro:string

  profileImgUrl: string | ArrayBuffer | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  profileImage: string| ArrayBuffer | null = null;

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
      address:[''],
      province: [''],
      country: [''],
      postalCode: [''],
      profileImage: [''],
  })
  }


  ngOnInit(): void {

    this.imgpro = environment.URL_UPLOAD

    this.loginSV.getUserProfile().subscribe(
      res => {
        console.log("UserData received:", res);
        this.UserData = res;
        console.log("ProfileImage from UserData:", this.UserData?.employeeId?.profileImage);
  
        // ตรวจสอบว่า profileImage มีค่าอยู่หรือไม่
        if (this.UserData?.employeeId?.profileImage) {
          // ใช้ URL ที่เซิร์ฟเวอร์ให้บริการ
          this.profileImgUrl = `http://localhost:3000/uploads/${this.UserData.employeeId.profileImage.replace(/\\/g, '/')}`;
          console.log('Generated profileImgUrl:', this.profileImgUrl);
        } else {
          this.profileImgUrl = './assets/img/Person-icon.jpg';
        }
  
        console.log('profileImgUrl:', this.profileImgUrl);
        this.UserInfoForm.patchValue(this.UserData);
      },
      error => {
        console.error('Error fetching user profile:', error);
      }
    );
    
    // this.sv.currentProfileImageUrl.subscribe(url => {
    //   this.profileImgUrl = url;
    //   console.log('Updated profileImgUrl from SharedService:', this.profileImgUrl); // แสดง URL ของรูปภาพที่ได้รับจาก SharedService
    // });
    
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
  
  goToChangePassword() {
    this.router.navigate(['/forget-password']); 
  }

}
