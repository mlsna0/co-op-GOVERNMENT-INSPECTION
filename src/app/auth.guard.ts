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
}
}
