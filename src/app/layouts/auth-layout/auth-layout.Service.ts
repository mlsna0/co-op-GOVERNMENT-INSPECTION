// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserRole: string;
  private currentUser: any;
  private users = [
    { email: 'superadmin@gmail.com', password: 's12345', role: 'superadmin' },
    { email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
    { email: 'user@gmail.com', password: 'user123', role: 'user' }
  ];

  constructor(private router: Router) {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      this.currentUserRole = savedUser.role;
      console.log('Loaded user from localStorage:', savedUser); // เพิ่มการพิมพ์ข้อมูลผู้ใช้ที่โหลดจาก localStorage
    } else {
      console.log('No user in localStorage'); // ตรวจสอบว่าไม่มีผู้ใช้ใน localStorage
    }
  }
  
  login(email: string, password: string): Observable<any> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUserRole = user.role;
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Login successful. User:', user); // ตรวจสอบข้อมูลผู้ใช้
      console.log('Current User Role:', this.currentUserRole); // ตรวจสอบบทบาทของผู้ใช้
      return of(user);
    } else {
      alert('Invalid credentials');
      return of(null);
    }
  }
  

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  register(email: string, password: string): Observable<any> {
    const userExists = this.users.find(u => u.email === email);
    if (!userExists) {
      const newUser = { id: this.generateId(), email, password, role: 'user', firstname: '', lastname: '' };
      this.users.push(newUser);
      this.currentUserRole = 'user';
      this.currentUser = newUser;
      localStorage.setItem('currentUser', JSON.stringify(newUser));
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getRole(): string {
    if (!this.currentUserRole) {
      const savedUser = JSON.parse(localStorage.getItem('currentUser'));
      this.currentUserRole = savedUser?.role;
      console.log('Retrieved role from localStorage:', this.currentUserRole); // ตรวจสอบบทบาทที่เรียกจาก localStorage
    }
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

  hasRole(role: string): boolean {
    return this.currentUserRole === role;
  }
}
