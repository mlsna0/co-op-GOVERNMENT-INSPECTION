import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/services/shared.service';
import { Router } from '@angular/router';

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
    private router: Router
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
