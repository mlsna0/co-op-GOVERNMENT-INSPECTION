import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/services/shared.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth-layout.Service';
import { loginservice } from 'app/layouts/login.services.';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  role: any

  constructor(
    private sv : SharedService,
    private router: Router,
    private as : AuthService,
    private lc : loginservice,
  ) { }

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

          // const userId = this.
        } 
        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: 'คุณได้เข้าสู่ระบบเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          customClass: {
            confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
          }
        }).then((result) => {
          if (result.isConfirmed) {
            document.querySelector('.swal2-confirm').setAttribute('style', 'background-color: #24a0ed; color: white;');

            if (response.role === 'superadmin') {
              this.router.navigate(['/reportuser']);
            } else  {
              this.router.navigate(['/dashboard']);
            } 
          }
        });
      },
      error => {
        console.error('Error logging in', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          customClass: {
            confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
          }
        });
      }
    );
  }
  

  onSubmit() {
    this.router.navigate(['/table-main']);
  }

  openFogetPassword() {
    this.router.navigate(['/forget-password']);
  }
  
  openRegister(){
    this.router.navigate(['/register']);
  }
}
