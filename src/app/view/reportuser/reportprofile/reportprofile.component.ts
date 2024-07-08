import { Component, OnInit } from '@angular/core';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportprofile',
  templateUrl: './reportprofile.component.html',
  styleUrls: ['./reportprofile.component.css']
})
export class ReportprofileComponent implements OnInit {

  user: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private ls :loginservice,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ls.getUserReport().subscribe(
      data => {
        if (data && data.length > 0) {
          this.user = data[0]; // Assuming data is an array, set the first user as the current user
        }
        this.loading = false;
      },
      err => {
        this.error = 'Failed to load data';
        this.loading = false;
      }
    );
  }
 }
 

