import { Component, OnInit,EventEmitter,  Output} from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {  ActivatedRoute, Router } from '@angular/router';
import { loginservice } from 'app/layouts/login.services.';
import { SharedService } from "../../services/shared.service";
import { AuthService } from "../../layouts/auth-layout/auth-layout.Service";
import { ProvinceService } from '../thaicounty/thaicounty.service';
import Swal from 'sweetalert2';
import $ from "jquery";
import 'bootstrap';
import { first } from 'rxjs';
import { environment } from 'environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage  } from 'ngx-image-cropper'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  UserID:any;
  EmployeeID:any;
  OrganizationID:any;
  selectedOrganizationID:any;
  UserData:any ={};
  DataOrganization:any ={};
  UserInfoForm:FormGroup;


  PersonINT:any=0;
  EditStatus: boolean=false;

  
  filteredAmphures = [];
  filteredTambons = [];


  isAmphureDisabled = true;
  isTambonDisabled = true;
  isPostCodeDisabled = true;
  
  isProvinceSelectOpen = false;
  isAmphureSelectOpen = false;
  isTambonSelectOpen = false;
  // isAmphureDisabled = false;
  // isTambonDisabled = false;

  nameTambons: string[] = [];
  zipCode: any[] = [];

  provinces: any[] = [];  // ตัวแปรสำหรับเก็บข้อมูลจังหวัด
  amphures: any[] = [];   // ตัวแปรสำหรับเก็บข้อมูลอำเภอ
  tambons: any[] = [];    // ตัวแปรสำหรับเก็บข้อมูลตำบล
  imgpro:string

  profileImgUrl:string;
  previousFile: File | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  profileImage: string| ArrayBuffer | null = null;

  showModal = false;
  shouldShowToast = false;
  // imageChangedEvent: any = '';
  // croppedImage: any = '';
  imageChangedEvent: any = null; // ใช้ any เพื่อความยืดหยุ่น
  croppedImage: SafeUrl | '' = '';
  // @Output() imageCropped = new EventEmitter<string>();

  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private authService: AuthService,
    private loginSV:loginservice,
    private router: Router,
    private ACrouter :ActivatedRoute,
    private ts: ProvinceService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService 
    
  ) { 

    this.UserInfoForm = this.fb.group({
      firstname: ["" ],
      lastname: [""],
      email: ["",  Validators.email],
      // password: ["", Validators.minLength(8)],
      // confirmpassword: ["", Validators.minLength(8)],
      // organization:['', ],
      // bearing:['', ],
      address:["", ],
      phone: ["", Validators.pattern('^[0-9]{10}$')],
      province: ['' ],
      amphure: ['' ],
      tambon: ['' ],
      postCode: [''],
      profileImage: ['']
  })
  }


  ngOnInit(): void {

    this.imgpro = environment.URL_UPLOAD

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
        // ตรวจสอบว่า profileImage มีค่าอยู่หรือไม่
        if (this.UserData?.employeeId?.profileImage) {
          // ใช้ URL ที่เซิร์ฟเวอร์ให้บริการ
          this.profileImgUrl = `http://localhost:3000/uploads/${this.UserData.employeeId.profileImage.replace(/\\/g, '/')}`;
          console.log('Generated profileImgUrl:', this.profileImgUrl);
        } else {
          this.profileImgUrl = './assets/img/Person-icon.jpg';
        }

        //Organization info
        this.sv.getOrganizationById(this.selectedOrganizationID).subscribe(res=>{
          this.DataOrganization = res;
          // console.log("Data of Organiz: ",this.DataOrganization)
        })
        console.log('profileImgUrl:', this.profileImgUrl);
        // this.UserInfoForm.patchValue(this.UserData);
        this.UserInfoForm.patchValue({
          firstname: this.UserData?.employeeId.firstname,
          lastname: this.UserData?.employeeId.lastname,
          email: this.UserData?.employeeId.email,
          // email: this.UserData?.email,
          // password: ["", Validators.minLength(8)],
          // confirmpassword: ["", Validators.minLength(8)],
          organization: this.UserData?.employeeId.organization,
          bearing: this.UserData?.employeeId.bearing,
          address:this.UserData?.employeeId.address,
          phone:this.UserData?.employeeId.phone,
          province:this.UserData?.employeeId.province,
          amphure: this.UserData?.employeeId.amphure,
          tambon: this.UserData?.employeeId.tambon,
          postCode: this.UserData?.employeeId.postCode,
          // // role: ['' ],
          profileImage:this.UserData?.employeeId.profileImage
        })
      },
      error => {
        console.error('Error fetching user profile:', error);
      },

 
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

  onFileUploadImgChange(event: any) {
    const file = event.target.files[0];
    console.log("file onfileUpload:",file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
    
      //   this.UserInfoForm.patchValue({
      //     profileImage: this.imageSrc
      // });
      };
      reader.readAsDataURL(file);
      // this.previousFile = file;
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


  openModal(): void {
    $('#profile-Modal').modal({
      backdrop: 'static', 
      keyboard: false    
    });
    $('#profile-Modal').modal('show');
    // document.body.classList.add('no-scroll');
    // this.showModal = true;
    // console.log("as",this.showModal)
  }
  refreshPage() {
    window.location.reload();
  }

  closeModal(): void {
    const modalContent = document.querySelector('.EditModal-content');
  
    // if (modalContent) {
    //   modalContent.classList.add('close');
  
    //   modalContent.addEventListener('animationend', () => {
    //     this.showModal = false;
    //     this.EditStatus = false;
    //     modalContent.classList.remove('close');
  
    
    //   }, { once: true });
    // }
    if($('#EditModal')){
          // ตรวจสอบว่าควรแสดง toast หรือไม่
          if (this.shouldShowToast) {
            this.toastr.success('อัปเดตโปรไฟล์สำเร็จ', 'สำเร็จ', {
              timeOut: 2500,
              positionClass: 'toast-top-right'
            });
    
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          }
    
          this.shouldShowToast = false; // รีเซ็ตค่า
      $('#EditModal').modal('hide')
    
    }
    if($('#profile-Modal')){
      // ตรวจสอบว่าควรแสดง toast หรือไม่
      if (this.shouldShowToast) {
        this.toastr.success('อัปเดตโปรไฟล์สำเร็จ', 'สำเร็จ', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });

        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }

      this.shouldShowToast = false; // รีเซ็ตค่า
  $('#profile-Modal').modal('hide')

}
  }
  editProfile() {
    // document.body.classList.add('no-scroll');
    this.EditStatus= true;
  }

  goToModal(){
    $('#EditProfile-Modal').modal({
      backdrop: 'static', // ป้องกันการปิดเมื่อคลิกด้านนอก
      keyboard: false     // ป้องกันการปิดด้วยแป้นพิมพ์ (เช่น ปุ่ม Esc)
    });
    $('#EditProfile-Modal').modal('show');
  }

  openorganizationModel(){
    $('#organizationModel').modal({
      backdrop: 'static', 
      keyboard: false    
    });
    $('#organizationModel').modal('show');
 

  }
  openEditProfileModal(){
    $('#EditModal').modal({
      backdrop: 'static', 
      keyboard: false    
    });
    $('#EditModal').modal('show');

  }
//////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////


  SaveUserInfo(){
    if (this.UserInfoForm.valid) {
    
      const userId = this.UserID;

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      console.log("fileInput > ",fileInput);
      const file = fileInput?.files?.[0]|| this.previousFile ;

      const updatedData = new FormData();
      Object.keys(this.UserInfoForm.controls).forEach(key => {
        updatedData.append(key, this.UserInfoForm.get(key)?.value);
      });
      if (file) {
        updatedData.append('profileImage', file);
        console.log("uploaded data profile :",file)
        }

      // ส่งข้อมูลที่แก้ไขแล้วไปยังเซิร์ฟเวอร์
      this.sv.updateUserProfileById(updatedData,userId).subscribe(response => {
        console.log('Response:', response);
  

        this.shouldShowToast = true; 
        this.closeModal();
        // setTimeout(() => {
        //   window.location.reload();
        // }, 2500);


      },
      error => {
        console.error('Error:', error);
        this.toastr.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์', 'ไม่สำเร็จ', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
      });
    }
    // this.EditStatus = false;
  }

  cancelEdit(){
    this.EditStatus= false;
  }
  
  goToChangePassword() {
    this.router.navigate(['/forget-password']); 
  }

}
