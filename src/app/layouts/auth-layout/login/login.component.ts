import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/services/shared.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth-layout.Service';
import { loginservice } from 'app/layouts/login.services.';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr'; // นำเข้า ToastrService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isActive:boolean;
  role: any

  passwordFieldType: string = 'password';

  constructor(
    private sv : SharedService,
    private router: Router,
    private as : AuthService,
    private lc : loginservice,
    private toastr: ToastrService // เพิ่ม ToastrService ใน constructor
  ) { 
    
  }

  ngOnInit(): void {
    
  }

  // onSubmit() {
  //   // Implement your login logic here
  //   if (this.email === 'admin@example.com' && this.password === 'password') {
  //     // Redirect to the dashboard or home page
  //     this.router.navigate(['/table-list']);
  //   } else {
  //     alert('Invalid credentials');
  //   }
  // }

  onLogin() {
    this.lc.login(this.email, this.password, this.role).subscribe(
      response => {
        console.log('Login successful', response);

        if (response.token) {
          localStorage.setItem('token', response.token);
  
          // เก็บบทบาทใน AuthService
          this.as.currentUserRole = response.user.role;
          localStorage.setItem('currentUser', JSON.stringify(response.user));
  
          // เพิ่มการพิมพ์เพื่อการดีบั๊ก
          console.log('Stored role in AuthService:', this.as.currentUserRole);
        }

        if (response.userIsActive  === false) {
          console.log("response.user.isActive : ",response.userIsActive)
          // แสดงแจ้งเตือนเมื่อผู้ใช้ไม่มีสิทธิ์ในการเข้าสู่ระบบ
          this.toastr.error('คุณไม่มีสิทธิ์ในการเข้าสู่ระบบ', 'ข้อผิดพลาด', {
            timeOut: 2500,
            positionClass: 'toast-top-right'
          });
          // ลบ token และข้อมูลผู้ใช้จาก localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          console.error('User is inactive');
          return;
        }

        // แสดงแจ้งเตือนด้วย Toastr
        this.toastr.success('เข้าสู่ระบบสำเร็จ', 'สำเร็จ', {
          timeOut: 2500,  
          positionClass: 'toast-top-right'
        });

        // นำทางผู้ใช้ตามบทบาทที่ได้รับ
        switch (response.user.role) {
          case 'superadmin':
            this.router.navigate(['/dashboard']);
            break;
          case 'admin':
            this.router.navigate(['/table-main']);
            break;
          case 'user':
            this.router.navigate(['/table-main']);
            break;
          default:
            this.router.navigate(['/dashboard']);
            break;
        }
      },
      error => {
        // แสดงแจ้งเตือนเมื่อเข้าสู่ระบบไม่สำเร็จ
        this.toastr.error('เข้าสู่ระบบไม่สำเร็จ', 'เกิดข้อผิดพลาด', {
          timeOut: 2500,
          positionClass: 'toast-top-right'
        });
        console.error('Login failed', error);
      }
    );
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } 
}

  onSubmit() {
    this.router.navigate(['/table-main']);
  }

  openFogetPassword() {
    this.router.navigate(['/forget-password']);
  }

  openRegister() {
    this.router.navigate(['/register']);
  }
}
