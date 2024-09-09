import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree,Router } from '@angular/router';
import { Observable } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

constructor(
  private ls :loginservice,
  private router: Router
){}
canActivate(): boolean {
  if (this.ls.isLoggedIn()) { // ใช้ method ของ service ที่คุณสร้างขึ้น
    return true;
  } else {
    this.router.navigate(['/login']);
    return false;
  }

  //  if (this.ls.isLoggedIn()) {
  //     const user = this.ls.getCurrentUser();

  //     if (user && user.role) {
  //       // ตรวจสอบสิทธิ์ของผู้ใช้และการเข้าถึง
  //       // ตัวอย่างเช่น:
  //       // - Role 'user' จะสามารถเข้าถึงหน้า 'profile' และ 'table-main' ได้
  //       // - Role 'admin' จะสามารถเข้าถึงทุกหน้าได้

  //       // กำหนดว่า admin หรือ user สามารถเข้าถึงหน้าไหนได้บ้าง
  //       const allowedRoutesForUser = ['profile', 'table-main'];
  //       const allowedRoutesForAdmin = ['dashboard', 'profile', 'table-list', 'data-detail', 'reportbuild', 'manageuser', 'manageagency', 'manageperson', 'profileuser', 'table-detail', 'typography', 'icons', 'signature', 'employee', 'upgrade', 'reportuser', 'map'];

  //       const currentRoute = this.router.url.split('/')[1]; // extract the path part of the URL

  //       if (user.role === 'user' && !allowedRoutesForUser.includes(currentRoute)) {
  //         this.router.navigate(['/']); // เปลี่ยนเส้นทางไปหน้าหลักหรือหน้าที่เหมาะสม
  //         return false;
  //       }

  //       if (user.role === 'admin' && !allowedRoutesForAdmin.includes(currentRoute)) {
  //         this.router.navigate(['/']); // เปลี่ยนเส้นทางไปหน้าหลักหรือหน้าที่เหมาะสม
  //         return false;
  //       }

  //       return true;
  //     } else {
  //       this.router.navigate(['/login']);
  //       return false;
  //     }
  //   } else {
  //     this.router.navigate(['/login']);
  //     return false;
  //   }

}

}
