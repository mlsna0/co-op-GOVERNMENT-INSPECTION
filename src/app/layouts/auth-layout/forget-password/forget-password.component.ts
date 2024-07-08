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
  email: string;
  password: string;
  confirmPassword: string;

  forgetPasswordForm: FormGroup;
  resetToken: string = '';

  constructor(
    private ls : loginservice,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) { 
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.controls['password'].value === form.controls['confirmpassword'].value ? null : { 'mismatch': true };
  }


  ngOnInit(): void {
    
  }
    onSubmit() {
    if (this.forgetPasswordForm.invalid) {
      console.log(this.forgetPasswordForm)
      alert('กรุณากรอกข้อมูลให้ถูกต้อง');
      return;
    }

    const { email, password, confirmpassword } = this.forgetPasswordForm.value;

    if (password !== confirmpassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    this.http.post('/api/forgot-password', { email, password })
      .subscribe(
        response => {
          alert('อีเมลถูกส่งไปแล้วเพื่อรีเซ็ตรหัสผ่าน');
          this.router.navigate(['/login']);
        },
        error => {
          console.error('Error:', error);
          alert('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
        }
      );
  }

}