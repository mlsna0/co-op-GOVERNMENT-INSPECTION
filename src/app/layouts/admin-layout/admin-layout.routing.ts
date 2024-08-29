
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { SignatureComponent } from '../../signature/signature.component';
import { EmployeeComponent } from '../../employee/employee.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { TableDetailComponent } from '../../view/table-detail/table-detail.component';
import {TableMainComponent } from '../../view/table-main/table-main.component';
import {DataDetailComponent } from '../../view/table-main/data-detail/data-detail.component';
import { LoginComponent } from '../auth-layout/login/login.component';
import { DashboardComponent } from 'app/view/dashboard/dashboard.component';
import { ProfileComponent} from '../../view/profile/profile.component';
import { ReportuserComponent } from '../../view/reportuser/reportuser.component';
import { ReportuserbuildComponent } from '../../view/reportuser/reportuserbuild/reportuserbuild.component';
import { ManageuserComponent } from '../../view/manageuser/manageuser.component';
import { ProfileuserComponent } from 'app/view/manageuser/profileuser/profileuser.component';
import { AuthGuard } from '../../auth.guard'; // นำเข้า AuthGuard ของคุณ
import { MapComponent } from '../../view/map/map.component';
import { ManageagencyComponent } from '../../view/manageagency/manageagency.component';

export const AdminLayoutRoutes: Routes = [
    // {
    //   path: '',
    //   children: [ {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // }]}
    // , {
    // path: '',
    // children: [ {
    //   path: 'userprofile',
    //   component: UserProfileComponent
    // }]
    // }, {
    //   path: '',
    //   children: [ {
    //     path: 'icons',
    //     component: IconsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'notifications',
    //         component: NotificationsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'maps',
    //         component: MapsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'typography',
    //         component: TypographyComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'upgrade',
    //         component: UpgradeComponent
    //     }]
    // }
    { path: 'dashboard',      component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'profile',        component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'table-list',     component: TableListComponent, canActivate: [AuthGuard] },
    { path: 'table-main',     component: TableMainComponent, canActivate: [AuthGuard] },
    { path: 'data-detail/:id',component: DataDetailComponent, canActivate: [AuthGuard] },
    { path: 'reportbuild',    component: ReportuserbuildComponent, canActivate: [AuthGuard] },
    { path: 'manageuser',     component: ManageuserComponent, canActivate: [AuthGuard] },
    { path: 'manageagency',     component: ManageagencyComponent, canActivate: [AuthGuard] },

    { path: 'profileuser',    component: ProfileuserComponent, canActivate: [AuthGuard] },
    { path: 'profileuser/:id', component: ProfileuserComponent, canActivate: [AuthGuard] },
    { path: 'table-detail/:id', component: TableDetailComponent, canActivate: [AuthGuard] },
    { path: 'typography',     component: TypographyComponent, canActivate: [AuthGuard] },
    { path: 'icons',          component: IconsComponent, canActivate: [AuthGuard] },
    { path: 'signature',      component: SignatureComponent, canActivate: [AuthGuard] },
    { path: 'employee',       component: EmployeeComponent, canActivate: [AuthGuard] },
    { path: 'upgrade',        component: UpgradeComponent, canActivate: [AuthGuard] },
    { path: 'reportuser',     component: ReportuserComponent, canActivate: [AuthGuard] },
    { path: 'map',            component: MapComponent, canActivate: [AuthGuard] },
    { path: 'login',          component: LoginComponent }, // เส้นทางล็อกอินไม่ต้องใช้ AuthGuard
    { path: '**',             redirectTo: 'login' } 

];
