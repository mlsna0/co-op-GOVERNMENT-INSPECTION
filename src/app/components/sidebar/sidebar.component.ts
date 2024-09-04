  import { Component, OnInit } from '@angular/core';
  import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'; 
  import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';

  declare const $: any;

  declare interface RouteInfo {
      path: string;
      title: string;
      icon: string;
      class: string;
      children?: RouteInfo[];
      open?: boolean; // เพิ่มเพื่อเก็บสถานะของเมนู
      roles?: string[]; // เพิ่มเพื่อกำหนดบทบาทที่สามารถเห็นเมนูนี้ได้
  }

  export const ROUTES: RouteInfo[] = [
      { path: '/dashboard', title: 'หน้าหลัก', icon: 'dashboard', class: '', roles: ['superadmin','admin'] },
      { path: '/profile', title: 'ผู้ใช้งาน', icon: 'person', class: '', roles: ['superadmin','admin', 'user'] },
      { path: '/table-main', title: 'การลงตรวจอิเล็กทรอนิค', icon: 'content_paste', class: '', roles: ['admin', 'user'] },
      
      
          // path: ' ', title: 'รายงาน', icon: 'assignment', class: '',

      { path: '/manageagency', title: 'การจัดการหน่วยงาน', icon: 'apartment', class: '', roles: ['superadmin'] },
      { path: '/manageuser', title: 'การจัดการผู้ใช้งาน', icon: 'manage_accounts', class: '', roles: ['superadmin'] },
        {  path: ' ', title: 'รายงาน', icon: 'assignment', class: '',
          children: [
              { path: '/reportuser', title: 'รายงานการเข้าใช้งาน', icon: 'camera_front', class: '', roles: ['superadmin'] },
              { path: '/reportbuild', title: 'รายงานการสร้างเอกสาร', icon: 'badge', class: '', roles: ['superadmin'] }
          ],
          roles: ['superadmin']
      },
      { path: '/login', title: 'ออกจากระบบ', icon: 'logout', class: 'active-pro nav-item', roles: ['superadmin','admin', 'user'] },
  ];

  @Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
  })
  export class SidebarComponent implements OnInit {
    // menuItems: any[];
    activeRoute: string;


    public menuItems: RouteInfo[] = ROUTES;
    activePath: string = '';
    constructor(
      private router: Router,  
      private route: ActivatedRoute,
      private authService: AuthService
    ) {
      // this.router.events.subscribe(() => {
      //   this.activeRoute = this.router.url;
      // });
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activePath = event.url;
    
        }
      });
    }

  
    ngOnInit() {
      const role = this.authService.getRole();
      // console.log('Role in sidebar.component.ts:', role); // ตรวจสอบบทบาทในคอมโพเนนต์
      this.menuItems = ROUTES.filter(menuItem => 
        !menuItem.roles || menuItem.roles.includes(role)
      );
      // console.log('Filtered menuItems:', this.menuItems); // ตรวจสอบรายการเมนูหลังการกรอง
    }



    isMobileMenu() {
      return $(window).width() <= 991;
    }

    toggleMenu(menuItem):void{
      menuItem.open = !menuItem.open;
    }

    isActive(path: string): boolean {
      return this.activeRoute === path;
    }

    handleMenuClick(menuItem: RouteInfo) {
      if (menuItem.path === '/login') {
        this.authService.logout(); // เรียกใช้ฟังก์ชัน logout
      }

    }


  }
