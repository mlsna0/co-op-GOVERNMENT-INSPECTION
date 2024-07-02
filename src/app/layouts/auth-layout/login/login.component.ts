import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/services/shared.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth-layout.Service';
import { loginservice } from 'app/layouts/login.services.';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

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
    console.log("email",this.email),
      console.log("password",this.password),
      
    this.lc.login(this.email, this.password).subscribe(
      
      response => {
        console.log('Login successful', response);
        this.router.navigate(['/dashboard']); // เปลี่ยนหน้าไปยัง dashboard
      },
      error => {
        alert('Invalid credentials');
      }
    );
  }

  onSubmit() {
    this.router.navigate(['/table-list']);
  }

  openFogetPassword() {
    this.router.navigate(['/forget-password']);
  }
  
  openRegister(){
    this.router.navigate(['/register']);
  }
}
