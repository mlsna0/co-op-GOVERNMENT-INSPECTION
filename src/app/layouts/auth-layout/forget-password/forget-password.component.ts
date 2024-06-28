import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/services/shared.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  email: string;
  password: string;
  confirmPassword: string;
  constructor(
    private sv : SharedService,
    private router: Router

  ) { }

  ngOnInit(): void {
    
  }
  onSubmit(
    
  ) {
    // Handle form submission
    if (this.password !== this.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }else{
      alert('รหัสผ่านตรงกัน');
      this.router.navigate(['/login']);
    }
    
}
}