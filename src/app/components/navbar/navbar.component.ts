import { Component, OnInit, ElementRef,Renderer2, HostListener } from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from '../../layouts/auth-layout/auth-layout.Service';
import { SharedService } from "../../services/shared.service";
import { loginservice } from "app/layouts/login.services.";


@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  private listTitles: any[];
  location: Location;
  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;

  ////////////////////////////////
  dropdownOpen = false;
  profileImgUrl:string;
  notificationDropdownOpen = false;
  profileDropdownOpen = false;
  unreadNotifications = [
    // ตัวอย่างข้อมูลแจ้งเตือน
    { message: 'You have 5 new tasks' },
    { message: 'Mike John responded to your email' },
    { message: 'You’re now friend with Andrew' },
    
  ];

  user: any;
  UserData:any ={};
  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private auth: AuthService,
    private renderer: Renderer2,
    private sv:SharedService,
    private LoginSV:loginservice,
  ) {
    this.location = location;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggler")[0];
    this.router.events.subscribe((event) => {
      this.sidebarClose();
      var $layer: any = document.getElementsByClassName("close-layer")[0];
      if ($layer) {
        $layer.remove();
        this.mobile_menu_visible = 0;
      }
    });

    this.LoginSV.getUserProfile().subscribe(
      res => {
        console.log("UserData received:", res);
        this.UserData = res;
        console.log("ProfileImage from UserData:", this.UserData?.employeeId?.profileImage);
  
        // ตรวจสอบว่า profileImage มีค่าอยู่หรือไม่
        if (this.UserData?.employeeId?.profileImage) {
          // ใช้ URL ที่เซิร์ฟเวอร์ให้บริการ
          this.profileImgUrl = `http://localhost:3000/uploads/${this.UserData.employeeId.profileImage.replace(/\\/g, '/')}`;
          console.log('Generated profileImgUrl:', this.profileImgUrl);
        } else {
          this.profileImgUrl = './assets/img/Person-icon.jpg';
        }
  
        console.log('profileImgUrl:', this.profileImgUrl);

      },
      error => {
        console.error('Error fetching user profile:', error);
      }
    );

    // this.sv.currentProfileImageUrl.subscribe(url=> this.profileImgUrl =url)
    
 
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName("body")[0];
    setTimeout(function () {
      toggleButton.classList.add("toggled");
    }, 500);

    body.classList.add("nav-open");

    this.sidebarVisible = true;
  }
  sidebarClose() {
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton.classList.remove("toggled");
    this.sidebarVisible = false;
    body.classList.remove("nav-open");
  }
  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    var $toggle = document.getElementsByClassName("navbar-toggler")[0];

    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
    const body = document.getElementsByTagName("body")[0];

    if (this.mobile_menu_visible == 1) {
      // $('html').removeClass('nav-open');
      body.classList.remove("nav-open");
      if ($layer) {
        $layer.remove();
      }
      setTimeout(function () {
        $toggle.classList.remove("toggled");
      }, 400);

      this.mobile_menu_visible = 0;
    } else {
      setTimeout(function () {
        $toggle.classList.add("toggled");
      }, 430);

      var $layer = document.createElement("div");
      $layer.setAttribute("class", "close-layer");

      if (body.querySelectorAll(".main-panel")) {
        document.getElementsByClassName("main-panel")[0].appendChild($layer);
      } else if (body.classList.contains("off-canvas-sidebar")) {
        document
          .getElementsByClassName("wrapper-full-page")[0]
          .appendChild($layer);
      }

      setTimeout(function () {
        $layer.classList.add("visible");
      }, 100);

      $layer.onclick = function () {
        //asign a function
        body.classList.remove("nav-open");
        this.mobile_menu_visible = 0;
        $layer.classList.remove("visible");
        setTimeout(function () {
          $layer.remove();
          $toggle.classList.remove("toggled");
        }, 400);
      }.bind(this);

      body.classList.add("nav-open");
      this.mobile_menu_visible = 1;
    }
  }

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === "#") {
      titlee = titlee.slice(1);
    }

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return "Dashboard";
  }

  ////////////////////////////////////////////////////////////////

  // Toggle notifications dropdown
  toggleNotificationDropdown(event: Event) {
    event.preventDefault();  // ป้องกันการเปลี่ยนหน้า
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    this.profileDropdownOpen = false; // Close profile dropdown when opening notifications
    event.stopPropagation();
  }

  // Toggle profile dropdown
  toggleProfileDropdown(event: Event) {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    this.notificationDropdownOpen = false; // Close notifications dropdown when opening profile
    event.stopPropagation();
  }


  // toggleDropdown(event: Event): void {
  //   this.dropdownOpen = !this.dropdownOpen;
  // }

  loadNotifications(): void {
    // ตัวอย่างโค้ดสำหรับโหลดข้อมูลแจ้งเตือนจาก API
    // this.notificationService.getUnreadNotifications().subscribe((notifications) => {
    //   this.unreadNotifications = notifications;
    // });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.element.nativeElement.contains(event.target)) {
      this.notificationDropdownOpen = false;
      this.profileDropdownOpen = false;
    }
  }
  openProfile() {
  
    this.router.navigate(["/profile"]);
  }
  openLogin(){
    this.auth.logout()
    // this.router.navigate(["/login"]);

  }
}
