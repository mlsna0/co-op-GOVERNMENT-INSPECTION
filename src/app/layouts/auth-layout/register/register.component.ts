import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;

  constructor() { }

  ngOnInit(): void {
    
  }
  onSubmit() {
    // Handle form submission
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Further form submission logic here
  }
}
