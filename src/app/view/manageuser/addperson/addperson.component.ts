import { Component, OnInit,  ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { loginservice } from "app/layouts/login.services.";
import Swal from "sweetalert2";

import { ThaiApiAddressService } from '../../../services/thai-api-address.service'
import { ProvinceService } from "app/view/thaicounty/thaicounty.service";
import { ToastrService } from 'ngx-toastr'; // Import ToastrService
@Component({
  selector: 'app-addperson',
  templateUrl: './addperson.component.html',
  styleUrls: ['./addperson.component.css']
})
export class AddpersonComponent implements OnInit {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string; // เพิ่มบรรทัดนี้
  phone: string;
  regisForm: any;
  Submitted:boolean=false;
  organization: any[] = [];


  provinces: any[] = [];
  amphures: any[] = [];
  
  tambons: any[] = [];
  nameTambons: string[] = [];

  zipCode: any[] = [];
  selectedProvince: any = null;
  selectedTambon: any = null;
  selectedAmphures: any = null;
  postCode: any[] = [];

  filteredAmphures = [];
  filteredTambons = [];

  isAmphureDisabled = true;
  isTambonDisabled = true;
  isPostCodeDisabled = true;

  imageSrc: string | ArrayBuffer | null = null;
  profileImage: string| ArrayBuffer | null = null;
  constructor(
    private fb: FormBuilder,
    private lc: loginservice,
    private router: Router,
    private toastr: ToastrService, // Inject ToastrService
    private ts :ProvinceService,
  ) {
    this.regisForm = this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["",[Validators.required, Validators.minLength(8)]],
      confirmpassword: ["", [Validators.required, Validators.minLength(8)]],
      organization:['', Validators.required],
      bearing:['', Validators.required],
      address:["", Validators.required],
      phone: ["", Validators.required, Validators.pattern('^[0-9]{10}$')],
      province: ['', Validators.required],
      amphure: ['', Validators.required],
      tambon: ['', Validators.required],
      postCode: ['', Validators.required],
      role: ['', Validators.required],
      profileImage: ['']
    }, { validator: this.passwordMatchValidator });
  }  

  ngOnInit(): void {
    // this.loadProvinces();
    // this.loadAmphures();
    // this.loadTambon()

    this.loadProvinces(); // Load provinces when the component initializes
    this.loadOrganizations();
  }


  onSubmit(data) {
    console.log(1111);
  
    this.Submitted = true;
    
    console.log('Form Valid:', this.regisForm.valid);
  console.log('Form Errors:', this.regisForm.errors);
  console.log('Password Errors:', this.regisForm.controls.password.errors);
  console.log('Confirm Password Errors:', this.regisForm.controls.confirmpassword.errors);


    if (this.regisForm.invalid) {
      // Check for specific errors in form controls
      if (this.regisForm.controls.password.errors?.minlength) {
        this.toastr.error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'รหัสผ่านไม่ครบ!', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
      } else if (this.regisForm.controls.confirmpassword.errors?.minlength) {
        this.toastr.error('รหัสผ่านยืนยันต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'รหัสผ่านยืนยันไม่ครบ!', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
      } else {
        // General error message if form is invalid but specific errors are not found
        this.toastr.error('กรุณากรอกข้อมูลให้ครบถ้วน', 'ข้อมูลไม่ครบถ้วน', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
      }
      return;
    }
  
    if (this.regisForm.value.password !== this.regisForm.value.confirmpassword) {
      this.toastr.error('กรุณากรอกรหัสผ่านให้ตรงกัน', 'รหัสผ่านไม่ตรงกัน!', {
        timeOut: 2500,
        positionClass: 'toast-top-right'
      });
      return;
    }
  
    this.lc.register(this.regisForm.value).subscribe(
      (response) => {
        console.log("User registered successfully", response);
        this.toastr.success('ผู้ใช้ถูกลงทะเบียนเรียบร้อยแล้ว', 'ลงทะเบียนสำเร็จ!', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
  
        // Redirect after a short delay to allow Toastr notification to be seen
        setTimeout(() => {
           window.location.reload(); 
        }, 1700);
      },
      (error) => {
        console.error("Error registering user", error);
        this.toastr.error('เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้', 'เกิดข้อผิดพลาด!', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmpassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mustMatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  loadProvinces() {
    this.ts.getProvincesWithDetails().subscribe(data => {
      this.provinces = data;
    });
  }

  onProvinceChange(provinceId: number) {
    this.regisForm.controls['amphure'].setValue('');
    this.regisForm.controls['tambon'].setValue('');
    this.filteredTambons = [];

    this.isAmphureDisabled = !provinceId;
    this.isTambonDisabled = true;
    this.isPostCodeDisabled = true;

    this.loadAmphures(provinceId); 
  }
  

  loadAmphures(provinceId: any) {
    this.ts.getamphures().subscribe(data => {
      this.amphures = data.filter(amphure => amphure.province_id === parseInt(provinceId));
      this.filteredAmphures = this.amphures;
    });
  }

  onAmphuresChange(amphureId: any) {
    this.regisForm.controls['tambon'].setValue('');

    this.isTambonDisabled = !amphureId;
    this.isPostCodeDisabled = true;

    this.loadTambons(amphureId,); // Load tambons for the selected amphure
  }

  loadTambons(amphureId: any) {
    this.ts.gettambons().subscribe(data => {
      this.tambons = data.filter(tambon => tambon.amphure_id === parseInt(amphureId));
      this.filteredTambons = this.tambons;
      this.nameTambons = this.tambons.map(tambon => tambon.name_th);
    });
  }

  onTambonChange(tambonId: any) {
    const selectedTambon = this.filteredTambons.find(tambon => tambon.id === parseInt(tambonId));
    if (selectedTambon) {
      this.zipCode = selectedTambon.zip_code;
      this.postCode = [this.zipCode]; // Update postCode as an array
      this.isPostCodeDisabled = false;
    }
  }


  deletedFileUpload(fileInput:  ElementRef){
    this.imageSrc = null;
    fileInput.nativeElement.value = '';
    this.regisForm.patchValue({
      profileImage: null
    });
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

loadOrganizations() {
  this.lc.getagency().subscribe(data => {
    console.log(data); // ตรวจสอบข้อมูลที่ได้รับ
        this.organization = data;
        console.log(data); // ตรวจสอบข้อมูลที่ได้รับ
      });
      
    }
}

// loadProvinces() {
//   this.lc.getagency().subscribe(data => {
//     this.organizations = data;
//   });
// }
// }