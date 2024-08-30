import { Component} from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public currentUserRole: string;
  private isPageReloaded = false;
  constructor(
    private router: Router
  ){

    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      this.currentUserRole = savedUser.role;
      // console.log('Loaded user from localStorage:', savedUser); // เพิ่มการพิมพ์ข้อมูลผู้ใช้ที่โหลดจาก localStorage
    } else {
      console.log('ไม่มีผู้ใช้ใน localStorage'); // ตรวจสอบว่าไม่มีผู้ใช้ใน localStorage
    }

    let token = localStorage.getItem("token")
    // console.log("Token", token);
    // console.log("get Role in appComnent",this.currentUserRole)

    if (window.performance) {
      if (performance.navigation.type === 1) {
        this.isPageReloaded = true;
      }
    }

    if(token && !this.isPageReloaded){
      const currrentUrl =this.router.url;
      // redirect to home page
      if(this.currentUserRole === "superadmin" || this.currentUserRole === "admin"){
        if(currrentUrl !== '/dashboard'){
          this.router.navigate(['/dashboard']);
        }
      }
      else{
        if(currrentUrl !== '/table-main'){
          this.router.navigate(['/table-main']);
        }
       
      }
      
    }

  }
  
}
