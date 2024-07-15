// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable,of } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserRole: string;
  private currentUser: any;
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
      this.currentUser =user;
      // localStorage.setItem('token', user.token);
      return of(user)
    } else {
      alert('Invalid credentials');
      return of(null);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  register(email: string, password: string) {
    const userExists = this.users.find(u => u.email === email);
    if (!userExists) {
      const newUser = { id: this.generateId(), email, password, role: 'user', firstname: '', lastname: '' };
      this.users.push(newUser);
      this.currentUserRole = 'user';
      this.currentUser = newUser;
      this.router.navigate(['/dashboard']);
      return of(newUser);
    } else {
      alert('User already exists');
      return of(null);
    }
  }

  logout() {
    this.currentUserRole = null;
    this.currentUser = null;
    localStorage.removeItem('token');
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
