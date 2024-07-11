import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { loginservice } from "app/layouts/login.services.";
import Swal from "sweetalert2";

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
  Submitted = false;
  
  constructor(
    private fb: FormBuilder,
    private lc: loginservice,
    private router: Router
  ) {
    this.regisForm = this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["",[Validators.required, Validators.minLength(8)]],
      confirmpassword: ["", [Validators.required, Validators.minLength(8)]],
      phone: ["", Validators.required],
    }, { validator: this.passwordMatchValidator });
  }  

  ngOnInit(): void {}


  onSubmit(data) {
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
      phone: this.regisForm.value.phone,
      role: "admin",
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
}
