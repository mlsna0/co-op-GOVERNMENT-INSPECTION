import { Component, OnInit, ElementRef } from '@angular/core';
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
  DataOrganization:any ={};
  currenUser:any ={};
  UserID:any;
  OrganizationID:any;
  selectedOrganizationID:any;

  UserRole:any;
  isSuperAdmin: boolean = false;
  EmployeeID:any;
  UserInfoForm:FormGroup;


  PersonINT:any=0;
  EditStatus: boolean=false;

  profileImgUrl:string;



  filteredAmphures = [];
  filteredTambons = [];


  isAmphureDisabled = true;
  isTambonDisabled = true;
  isPostCodeDisabled = true;

  nameTambons: string[] = [];
  zipCode: any[] = [];

  provinces: any[] = [];  // ตัวแปรสำหรับเก็บข้อมูลจังหวัด
  amphures: any[] = [];   // ตัวแปรสำหรับเก็บข้อมูลอำเภอ
  tambons: any[] = [];    // ตัวแปรสำหรับเก็บข้อมูลตำบล
//การอัปโหลดรูปภาพ
  imageSrc: string | ArrayBuffer | null = null;
  profileImage: string| ArrayBuffer | null = null;
//เปิด/ปิด การแสดงรหัสผ่าน 
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';

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
      email: ["", [ Validators.email]],
      // password: ["", Validators.minLength(8)],
      // confirmpassword: ["", Validators.minLength(8)],
      organization:['', ],
      address:["", ],
      phone: ["",[ Validators.pattern('^[0-9]{10}$')]],
      province: [''],
      amphure: ['' ],
      tambon: ['' ],
      postCode: [''],
      // role: ['' ],
      profileImage: ['']
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

    this.sv.getUserProfileById(this.UserID).subscribe(
      res =>{
      this.UserData = res;
      console.log("get UserDataById : ",this.UserData)

      if (this.UserData?.employeeId?.profileImage) {
        // ใช้ URL ที่เซิร์ฟเวอร์ให้บริการ
        this.profileImgUrl = `http://localhost:3000/uploads/${this.UserData.employeeId.profileImage.replace(/\\/g, '/')}`;
        console.log('Generated profileImgUrl:', this.profileImgUrl);
      } else {
        this.profileImgUrl = './assets/img/Person-icon.jpg';
      }
      this.OrganizationID = this.UserData?.employeeId?.agencies; //for infomation agency/organization
      console.log( " this.OrganizationID > ",this.OrganizationID)
      this.selectedOrganizationID = this.OrganizationID; //for infomation agency/organization
       console.log( "this.selectedOrganizationID > ",this.selectedOrganizationID)
      this.sv.getOrganizationById(this.selectedOrganizationID).subscribe(res=>{
        this.DataOrganization = res;
        console.log("Data of Organiz: ",this.DataOrganization)
      });

      this.UserRole =this.UserData?.role
      this.isSuperAdmin = this.UserRole === 'superadmin';
      this.UserInfoForm.patchValue({
        firstname: this.UserData?.employeeId.firstname,
        lastname: this.UserData?.employeeId.lastname,
        email: this.UserData?.employeeId.email,
        // email: this.UserData?.email,
        // password: ["", Validators.minLength(8)],
        // confirmpassword: ["", Validators.minLength(8)],
        organization: this.UserData?.employeeId.organization,
        address:this.UserData?.employeeId.address,
        phone:this.UserData?.employeeId.phone,
        province:this.UserData?.employeeId.province,
        amphure: this.UserData?.employeeId.amphure,
        tambon: this.UserData?.employeeId.tambon,
        postCode: this.UserData?.employeeId.postCode,
        // // role: ['' ],
        profileImage:this.UserData?.employeeId?.profileImage
      })
    })

    this.loginSV.getUserProfile().subscribe(res=>{
      this.currenUser = res
    })
  
    // this.sv.currentProfileImageUrl.subscribe(url=> this.profileImgUrl= url);

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


  onProvinceChange(provinceId: number) {
    if (!provinceId) {
      return;
    }
  
    // ล้างค่าเฉพาะในกรณีที่มีการเลือกจังหวัดที่แตกต่างกัน
    if (this.UserInfoForm.controls['province'].value !== provinceId) {
      this.UserInfoForm.patchValue({
        amphure: '',
        tambon: ''
      });
      this.filteredTambons = [];
      this.isAmphureDisabled = false;
      this.isTambonDisabled = true;
      this.isPostCodeDisabled = true;
    }
  
    this.loadAmphures(provinceId); 
  }

  loadAmphures(provinceId: any) {
    this.ts.getamphures().subscribe(data => {
        this.amphures = data.filter(amphure => amphure.province_id === parseInt(provinceId));
        this.filteredAmphures = this.amphures;

        if (this.amphures.length > 0) {
            this.isAmphureDisabled = false; // เปิดฟิลด์อำเภอถ้ามีอำเภอในจังหวัดนี้
        }

        const currentAmphureId = this.UserInfoForm.controls['amphure'].value;
        if (this.amphures.some(amphure => amphure.id === currentAmphureId)) {
            this.isTambonDisabled = false; // ปลดล็อคฟิลด์ตำบลถ้ามีอำเภอปัจจุบันที่ตรงกับ amphureId
            this.loadTambons(currentAmphureId); // โหลดตำบลตามอำเภอปัจจุบัน
        } else {
            this.isTambonDisabled = true; // ล็อคฟิลด์ตำบลถ้าไม่มีอำเภอที่ตรงกับ amphureId
        }
    });
}


onAmphuresChange(amphureId: any) {
  if (!amphureId) {
      return;
  }

  // ล้างค่าตำบลถ้ามีการเลือกอำเภอที่แตกต่างกัน
  if (this.UserInfoForm.controls['amphure'].value !== amphureId) {
      this.UserInfoForm.patchValue({
          tambon: '',
          postCode: '' // ล้างรหัสไปรษณีย์ด้วยเมื่ออำเภอเปลี่ยน
      });
      this.filteredTambons = []; // ล้างข้อมูลตำบลที่กรองไว้ก่อนหน้า
      this.isTambonDisabled = true; // ล็อคฟิลด์ตำบลก่อนที่จะโหลดตำบลใหม่
      this.isPostCodeDisabled = true;
  }

  // โหลดตำบลใหม่ตามอำเภอที่เลือก
  this.loadTambons(amphureId);
}


loadTambons(amphureId: any) {
  this.ts.gettambons().subscribe(data => {
      this.tambons = data.filter(tambon => tambon.amphure_id === parseInt(amphureId));
      this.filteredTambons = this.tambons;

      if (this.filteredTambons.length > 0) {
          this.isTambonDisabled = false; // ปลดล็อคฟิลด์ตำบลถ้ามีข้อมูลตำบล
      } else {
          this.isTambonDisabled = true; // ล็อคฟิลด์ตำบลถ้าไม่มีข้อมูลตำบล
      }
  });
}

  onTambonChange(tambonId: any) {
    const selectedTambon = this.filteredTambons.find(tambon => tambon.id === parseInt(tambonId));
    if (selectedTambon) {
        this.zipCode = selectedTambon.zip_code;
        this.UserInfoForm.patchValue({
            postCode: this.zipCode // อัปเดตค่ารหัสไปรษณีย์ในฟอร์ม
        });
        this.isPostCodeDisabled = false; // ปลดล็อคฟิลด์รหัสไปรษณีย์
    } else {
        this.isPostCodeDisabled = true; // ล็อคฟิลด์รหัสไปรษณีย์หากไม่พบตำบล
    }
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
        this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
}

onFileUploadImgChange(event: any) {
  const file = event.target.files[0];
  console.log("file",file);
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

deletedFileUpload(){

  const fileInput = document.getElementById('profileImage') as HTMLInputElement;
  const btnAddBox = document.getElementById('btn-add-box'); // เพิ่มส่วนนี้

  if (fileInput) {
    fileInput.value = '';
  }

  if (btnAddBox) { // เพิ่มส่วนนี้
    btnAddBox.style.display = 'none';
  }
  this.imageSrc = null;
  this.UserInfoForm.patchValue({
    profileImage: null
  });
}
// resetPassword(UserID: string,){
//   console.log('UserID to reset: ',UserID)
//   console.log('UserID to reset: ',this.UserData.role)


//   console.log('currenUser to reset: ',this.currenUser._id)


//     this.sv.resetPassword(UserID   ).subscribe(
//       response => {
//         console.log('Password reset successful:', response);
//       },
//       error => {
//         console.error('Password reset failed:', error);
//       }
//     );
//   }
resetPassword(UserID: string, newPassword: string) {
  this.loginSV.resetUserPassword(UserID).subscribe(
    response => {
      console.log('Password reset successful:', response);
    },
    error => {
      console.error('Password reset failed:', error);
    }
  );
}
  BackRoot(){
    if (window.history.length > 1) {
      window.history.back(); // ใช้ฟังก์ชันของเบราว์เซอร์เพื่อกลับไปหน้าที่แล้ว
    } else {
      this.router.navigate(['/manageuser']); // กรณีที่ไม่มีประวัติให้เปลี่ยนเส้นทางไปที่ '/manageuser'
    }
  }
  editProfile() {
    // Add your edit profile logic here
    this.EditStatus= true;
    // this.PersonINT++;
    // console.log('Edit profile clicked',this.PersonINT);
  }

  SaveUserInfo() {
    if (this.UserInfoForm.valid) {
      // const updatedData = this.UserInfoForm.value;
      const userId = this.UserID;

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      console.log("fileInput > ",fileInput);
      const file = fileInput?.files?.[0]; // Get the file from the input

      const updatedData = new FormData();
      Object.keys(this.UserInfoForm.controls).forEach(key => {
        updatedData.append(key, this.UserInfoForm.get(key)?.value);
      });
     if (file) {
      updatedData.append('profileImage', file);
      }
      this.sv.updateUserProfileById(updatedData, userId).subscribe(response => {
        console.log('Response:', response);
  
        if (response && response.user) {
          if (response?.user?.employeeId && response?.user?.employeeId?.firstname) {
            this.UserData = response;
           
          } else {
            console.error('Firstname not found in user data');
          }
        } else {
          console.error('Unexpected response format', response);
        }
      });
    }
    this.EditStatus= false;
  }
  
  
  
  cancelEdit(){
    this.EditStatus= false;
  }
  openorganizationModel(){
    $('#organizationModel').modal({
      backdrop: 'static', 
      keyboard: false    
    });
    $('#organizationModel').modal('show');
 

  }
  
}