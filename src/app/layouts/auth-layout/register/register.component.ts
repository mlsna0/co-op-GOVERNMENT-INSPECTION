import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loginservice } from 'app/layouts/login.services.';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string; // เพิ่มบรรทัดนี้
  phone: string;

  regisForm: any;

  constructor(
    private fb: FormBuilder,
    private lc: loginservice,
    private router: Router,
  ) {
    this.regisForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmpassword: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  onSubmit(data) {
    if (this.regisForm.invalid) {
      return;
    }

    // if (this.regisForm.value.password !== this.regisForm.value.confirmPassword) {
    //   alert('Passwords do not match');
    //   return;
    // }

    const newUser = {
      firstName: this.regisForm.value.firstname,
      lastName: this.regisForm.value.lastname,
      email: this.regisForm.value.email,
      password: this.regisForm.value.password,
      confirmpassword: this.regisForm.value.confirmpassword,
      phone: this.regisForm.value.phone,
      role: 'user'
    };

    this.lc.register(newUser).subscribe(
      response => {
        console.log('User registered successfully', response);
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error registering user', error);
      }
    );
  }
}
