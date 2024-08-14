import { Component, OnInit } from '@angular/core';
import { loginservice } from 'app/layouts/login.services.';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  changePasswordForm: FormGroup;


  constructor(
    private ls : loginservice,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) { 
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    return form.controls['newPassword'].value === form.controls['confirmNewPassword'].value ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
        alert('กรุณากรอกข้อมูลให้ถูกต้อง');
        return;
    }

    const { oldPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

    if (newPassword !== confirmNewPassword) {
        alert('รหัสผ่านใหม่ไม่ตรงกัน');
        return;
    }

    // ส่งข้อมูลไปที่ service โดยเพิ่ม confirmPassword
    this.ls.changePassword(oldPassword, newPassword, confirmNewPassword)
        .subscribe(
            response => {
                alert('รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว');
                this.router.navigate(['/profile']); // เปลี่ยนเส้นทางไปยังหน้าโปรไฟล์
            },
            error => {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง');
            }
        );
}
  goBack(): void {
    this.router.navigate(['/profile']); // Adjust the route to your profile page
  }
}