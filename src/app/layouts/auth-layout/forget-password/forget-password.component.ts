import { Component, OnInit } from '@angular/core';
import { loginservice } from 'app/layouts/login.services.';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  changePasswordForm: FormGroup;

  oldPasswordFieldType: string = 'password';
  newPasswordFieldType: string = 'password';
  confirmNewPasswordFieldType: string = 'password'
  
  constructor(
    private ls : loginservice,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService
  ) { 
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    return form.controls['newPassword'].value === form.controls['confirmNewPassword'].value ? null : { 'mismatch': true };
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'oldPassword') {
        this.oldPasswordFieldType = this.oldPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'newPassword') {
      this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmNewPassword') {
        this.confirmNewPasswordFieldType = this.confirmNewPasswordFieldType === 'password' ? 'text' : 'password';
    }
}

onSubmit() {
  if (this.changePasswordForm.invalid) {
    this.toastr.error('กรุณากรอกข้อมูลให้ถูกต้อง', 'ข้อผิดพลาด');
    return;
  }

  const { oldPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

  if (newPassword !== confirmNewPassword) {
    this.toastr.error('รหัสผ่านใหม่ไม่ตรงกัน', 'ข้อผิดพลาด');
    return;
  }

  // ส่งข้อมูลไปที่ service โดยเพิ่ม confirmPassword
  this.ls.changePassword(oldPassword, newPassword, confirmNewPassword)
    .subscribe(
      response => {
        this.toastr.success('รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว', 'สำเร็จ');
        this.router.navigate(['/profile']); // เปลี่ยนเส้นทางไปยังหน้าโปรไฟล์
      },
      error => {
        console.error('Error:', error);
        this.toastr.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง', 'ข้อผิดพลาด');
      }
    );
}

  goBack(): void {
    this.router.navigate(['/profile']); // Adjust the route to your profile page
  }
}