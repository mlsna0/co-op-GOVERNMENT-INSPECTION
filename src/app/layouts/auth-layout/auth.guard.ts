import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth-layout.Service';
@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
  
    constructor(private authService: AuthService, private router: Router) {}
  
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      const expectedRole = route.data['role'] as string;
  
      if (!this.authService.hasRole(expectedRole)) {
        this.router.navigate(['/unauthorized']); // เปลี่ยนไปยังหน้าที่ผู้ใช้ไม่มีสิทธิ์
        return false;
      }
  
      return true;
    }
  }