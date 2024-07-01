import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from "../../../services/shared.service";

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
  confirmPassword: string; // เพิ่มบรรทัดนี้
  phone: string;

  regisForm: any;

  constructor(
    private fb: FormBuilder,
    private sv: SharedService,
    private router: Router,
  ) {
    this.regisForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  onSubmit(data) {
    if (this.regisForm.invalid) {
      return;
    }

    if (this.regisForm.value.password !== this.regisForm.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const newUser = {
      firstName: this.regisForm.value.firstName,
      lastName: this.regisForm.value.lastName,
      email: this.regisForm.value.email,
      password: this.regisForm.value.password,
      phone: this.regisForm.value.phone,
      role: 'user'
    };

    this.sv.register(newUser).subscribe(
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
