import { Component, OnInit,  ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { loginservice } from "app/layouts/login.services.";
import Swal from "sweetalert2";

import { ThaiApiAddressService } from '../../../services/thai-api-address.service'
import { ProvinceService } from "app/view/thaicounty/thaicounty.service";
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string; // เพิ่มบรรทัดนี้
  phone: string;
  regisForm: any;
  Submitted:boolean=false;

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

  //เปิด/ปิด การแสดงรหัสผ่าน 
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  constructor(
    private fb: FormBuilder,
    private lc: loginservice,
    private router: Router,
   
    private ts :ProvinceService,
  ) {
    this.regisForm = this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["",[Validators.required, Validators.minLength(8)]],
      confirmpassword: ["", [Validators.required, Validators.minLength(8)]],
      organization:['', Validators.required],
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
  }


  onSubmit(data) {
    console.log(1111)
    this.Submitted = true; 
    if (this.regisForm.invalid) {
      if (this.regisForm.controls.password.errors?.minlength || this.regisForm.controls.confirmpassword.errors?.minlength) {
        Swal.fire({
          title: "รหัสผ่านไม่ครบ!",
          text: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
          icon: "error",
          confirmButtonText: "ตกลง",
        });
      }
      return;
    }
  
    if (this.regisForm.value.password !== this.regisForm.value.confirmpassword) {
      Swal.fire({
        title: "รหัสผ่านไม่ตรงกัน!",
        text: "กรุณากรอกรหัสผ่านให้ตรงกัน",
        icon: "error",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "custom-confirm-button",
        },
      });
      return;
    }
  
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    console.log(fileInput);
    
    const file = fileInput?.files?.[0]; // Get the file from the input
  
    const formData = new FormData();
    Object.keys(this.regisForm.controls).forEach(key => {
      formData.append(key, this.regisForm.get(key)?.value);
    });
    if (file) {
      formData.append('profileImage', file);
    }
  
    this.lc.register(formData).subscribe(
      (response) => {
        console.log("User registered successfully", response);
        Swal.fire({
          title: "ลงทะเบียนสำเร็จ!",
          text: "ผู้ใช้ถูกลงทะเบียนเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "custom-confirm-button",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            document.querySelector(".swal2-confirm")?.setAttribute(
              "style",
              "background-color: #24a0ed; color: white;"
            );
            this.router.navigate(["/login"]);
          }
        });
      },
      (error) => {
        console.error("Error registering user", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้",
          icon: "error",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "custom-confirm-button",
          },
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

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
        this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
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

//   onFileUploadImgChange(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       const userData = this.regisForm.value; // ดึงข้อมูลผู้ใช้จากฟอร์ม
  
//       this.lc.register(userData, file).subscribe(
//         (response) => {
//           console.log('User registered and image uploaded successfully', response);
//           this.imageSrc = URL.createObjectURL(file); // แสดงตัวอย่างภาพ
//         },
//         (error) => {
//           console.error('Registration or file upload failed', error);
//           Swal.fire({
//             title: "Error",
//             text: "การลงทะเบียนหรืออัปโหลดไฟล์ล้มเหลว",
//             icon: "error",
//             confirmButtonText: "ตกลง",
//           });
//         }
//       );
//     }
// }

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


}