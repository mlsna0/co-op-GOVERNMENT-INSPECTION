import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile = {
    name: 'Ramesh',
    description: "I'm a Software Engineer in an MNC, I'm really a nice guy, introvert for communication, good at programming.",
    accountType: 'User',
    email: 'user@gmail.com',
    lifeGoals: [
      'Achieve Success in Life',
      'Enjoy Life to the fullest'
    ]
  };
  constructor() { }

  ngOnInit(): void {
  }

  editProfile() {
    // Add your edit profile logic here
    console.log('Edit profile clicked');
  }
}
