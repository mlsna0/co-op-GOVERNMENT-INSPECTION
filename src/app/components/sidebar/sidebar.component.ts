import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    children?: RouteInfo[]; 
    open?: boolean; // Add this to keep track of the menu state
    
}
export const ROUTES: RouteInfo[] = [


   { path: '/dashboard', title: 'หน้าหลัก',  icon: 'dashboard', class: '' },
    // { path: '/table-list', title: 'การลงตรวจอิเล็กทรอนิค',  icon:'content_paste', class: '' },
    { path: '/table-main', title: 'การลงตรวจอิเล็กทรอนิค',  icon:'content_paste', class: '' },
    { path: '/signature', title: 'การลงเซ็น',  icon:'note_alt', class: '' },
    { path: ' ', title: 'รายงาน' , icon:'assignment', class:'',
      children: [
        { path: '/reportuser', title: 'รายงานสมัครเข้าใช้งาน', icon: 'manage_accounts', class: '' },
        { path: '/reportbuild', title: 'รายงานการสร้างฟอร์ม', icon: 'badge', class: '' }
      ]
    },
    // { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
    // { path: '/table-list', title: 'Table List',  icon:'content_paste', class: '' },
    // { path: '/typography', title: 'Typography',  icon:'library_books', class: '' },
    // { path: '/icons', title: 'Icons',  icon:'bubble_chart', class: '' },
   
    // { path: '/notifications', title: 'Notifications',  icon:'notifications', class: '' },
    // { path: '/upgrade', title: 'Upgrade to PRO',  icon:'unarchive', class: 'active-pro' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  activeRoute: string;
  
  constructor(
    private router: Router, 
    private route: ActivatedRoute
  ) {

    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });
   }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
 toggleMenu(menuItem) {
    menuItem.open = !menuItem.open;
  }

  isActive(path: string): boolean {
    return this.activeRoute === path;
  }

}
