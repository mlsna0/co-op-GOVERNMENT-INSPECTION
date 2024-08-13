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


@Component({
  selector: 'app-profileuser',
  templateUrl: './profileuser.component.html',
  styleUrls: ['./profileuser.component.css']
})
export class ProfileuserComponent implements OnInit {

  userId: string | null = null;
  user: any;

  UserData:any ={};
  UserInfoForm:FormGroup;


  PersonINT:any=0;
  EditStatus: boolean=false;

  profileImgUrl:string;
  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private authService: AuthService,
    private loginSV:loginservice,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { 

    this.UserInfoForm = this.fb.group({
      firstname:[''],
      lastname:[''],
      bearing: [''], // Add this ตำแหน่งหน้าที่
      company: [''], // Add this องค์กร
      address:[''],
      province: [''],
      tambon: [''],
      amphure: [''],
      country: [''],
      postCode: [''],
      email: [''], // Add this
      phone: [''], // Add this
  })
  }


  ngOnInit(): void {
    this.loginSV.getUserProfile().subscribe(
      res => {
      this.UserData = res;
      console.log("onInit get UserData: ", this.UserData);
      this.UserInfoForm.patchValue(this.UserData);

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.getUserProfile(id); // Fetch user data based on id
        }
      });

    });
    this.sv.currentProfileImageUrl.subscribe(url=> this.profileImgUrl= url)
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
    this.EditStatus= false;
  }

  getUserProfile(userId: string) {
    this.loginSV.getUserById(userId).subscribe(
      data => {
        this.user = data;
        this.UserInfoForm.patchValue(this.user);
      },
      error => {
        console.error('Error fetching user profile:', error);
      }
    );
  }
  
}
