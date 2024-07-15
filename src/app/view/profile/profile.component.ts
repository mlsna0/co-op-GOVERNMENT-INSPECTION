import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { loginservice } from 'app/layouts/login.services.';
import { SharedService } from "../../services/shared.service";
import { AuthService } from "../../layouts/auth-layout/auth-layout.Service"
import Swal from 'sweetalert2';
import $ from "jquery";
import 'bootstrap';
import { first } from 'rxjs';


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

  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private authService: AuthService,
    private loginSV:loginservice,
    private router: Router,
  ) { 

    this.UserInfoForm = this.fb.group({
      firstname:[''],
      lastname:[''],
      address:[''],
      province: [''],
      country: [''],
      postalCode: [''],
  })
  }


  ngOnInit(): void {
    this.loginSV.getUserProfile().subscribe(res => {
      this.UserData = res;
      console.log("onInit get UserData: ", this.UserData);
      this.UserInfoForm.patchValue(this.UserData);
    });
  }

  editProfile() {
    // Add your edit profile logic here
    this.EditStatus= true;
    this.PersonINT++;
    console.log('Edit profile clicked',this.PersonINT);
  }

  SaveUserInfo(){
    if (this.UserInfoForm.valid) {
      const updatedData = this.UserInfoForm.value;
      // ส่งข้อมูลที่แก้ไขแล้วไปยังเซิร์ฟเวอร์
      this.sv.updateUserProfile(updatedData).subscribe(response => {
        this.UserData = response;
        this.EditStatus = false;
      });
    }

  }
  cancelEdit(){

  }
  
}
