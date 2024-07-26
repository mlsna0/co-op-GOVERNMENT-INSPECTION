import { Component, OnInit } from "@angular/core";
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
    }, { validator: this.passwordMatchValidator });
  }  

  ngOnInit(): void {
    // this.loadProvinces();
    // this.loadAmphures();
    // this.loadTambon()

    this.loadProvinces(); // Load provinces when the component initializes
  }


  onSubmit(data) {
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

    // ตรวจสอบการยืนยันรหัสผ่าน
    if (
      this.regisForm.value.password !== this.regisForm.value.confirmpassword
    ) {
      Swal.fire({
        title: "รหัสผ่านไม่ตรงกัน!",
        text: "กรุณากรอกรหัสผ่านให้ตรงกัน",
        icon: "error",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "custom-confirm-button", // กำหนด CSS class ที่สร้างขึ้น
        },
      });
      return;
    }

    const newUser = {
      firstname: this.regisForm.value.firstname,
      lastname: this.regisForm.value.lastname,
      email: this.regisForm.value.email,
      password: this.regisForm.value.password,
      confirmpassword: this.regisForm.value.confirmpassword,
      organization: this.regisForm.value.organization,
      address:this.regisForm.value.address,
      phone: this.regisForm.value.phone,
      province: this.regisForm.value.province,
      amphure: this.regisForm.value.amphure,
      tambon: this.regisForm.value.tambon,
      postCode : this.regisForm.value.postCode,
      role: this.regisForm.value.role,
    };

    this.lc.register(newUser).subscribe(

      (response) => {
        console.log("User registered successfully", response);
        Swal.fire({
          title: "ลงทะเบียนสำเร็จ!",
          text: "ผู้ใช้ถูกลงทะเบียนเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "custom-confirm-button", // กำหนด CSS class ที่สร้างขึ้น
          },
        }).then((result) => {
          if (result.isConfirmed) {
            document
              .querySelector(".swal2-confirm")
              .setAttribute(
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
            confirmButton: "custom-confirm-button", // กำหนด CSS class ที่สร้างขึ้น
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

 
}