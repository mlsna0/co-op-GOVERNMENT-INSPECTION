import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    children?: RouteInfo[]; 
}
export const ROUTES: RouteInfo[] = [


   { path: '/dashboard', title: 'หน้าหลัก',  icon: 'dashboard', class: '' },
    // { path: '/table-list', title: 'การลงตรวจอิเล็กทรอนิค',  icon:'content_paste', class: '' },
    { path: '/table-main', title: 'การลงตรวจอิเล็กทรอนิค',  icon:'content_paste', class: '' },
    { path: '/reportuser', title: 'รายงานสมัครเข้าใช้งาน' , icon:'manage_accounts', class:''},
    // { path: '/map', title: 'แผนที่ประเทศไทย', icon: 'map', class:''},
    // { path: '/reportuser', title: 'รายงานสมัครเข้าใช้งาน' , icon:'person', class:'',
    //   children: [
    //     { path: '/reportuser/reportuser', title: 'Sub Report 1', icon: 'person', class: '' },
    //     { path: '/reportuser/reportprofile', title: 'Sub Report 2', icon: 'person', class: '' }
    //   ]
    // },
    // { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
    // { path: '/table-list', title: 'Table List',  icon:'content_paste', class: '' },
    // { path: '/typography', title: 'Typography',  icon:'library_books', class: '' },
    // { path: '/icons', title: 'Icons',  icon:'bubble_chart', class: '' },
    { path: '/signature', title: 'การลงเซ็น',  icon:'note_alt', class: '' },
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

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
