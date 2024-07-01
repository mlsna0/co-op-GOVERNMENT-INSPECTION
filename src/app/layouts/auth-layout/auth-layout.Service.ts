// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserRole: string;
  private users = [
    { email: 'superadmin@gmail.com', password: 's12345', role: 'superadmin' },
    { email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
    { email: 'user@gmail.com', password: 'user123', role: 'user' }
  ];

  constructor(private router: Router) {}

  login(email: string, password: string) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUserRole = user.role;
      this.router.navigate(['/table-list']);
    } else {
      alert('Invalid credentials');
    }
  }

  register(email: string, password: string) {
    const userExists = this.users.find(u => u.email === email);
    if (!userExists) {
      this.users.push({ email, password, role: 'user' });
      this.currentUserRole = 'user';
      this.router.navigate(['/dashboard']);
    } else {
      alert('User already exists');
    }
  }

  logout() {
    this.currentUserRole = null;
    this.router.navigate(['/login']);
  }

  getRole(): string {
    return this.currentUserRole;
  }

  isSuperAdmin(): boolean {
    return this.currentUserRole === 'superadmin';
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'superadmin';
  }

  isUser(): boolean {
    return this.currentUserRole === 'user' || this.currentUserRole === 'admin' || this.currentUserRole === 'superadmin';
  }
  // register(user: RegisterModel): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/register`, user);
  // }

}
