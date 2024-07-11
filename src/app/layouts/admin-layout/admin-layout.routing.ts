import { Routes } from '@angular/router';

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
import { LoginComponent } from '../auth-layout/login/login.component';
import { DashboardComponent } from 'app/view/dashboard/dashboard.component';
import { ProfileComponent} from '../../view/profile/profile.component';
import { ReportuserComponent } from '../../view/reportuser/reportuser.component';
import { ReportprofileComponent } from '../../view/reportuser/reportprofile/reportprofile.component';
import { ReportuserbuildComponent } from '../../view/reportuser/reportuserbuild/reportuserbuild.component';

import { MapComponent } from '../../view/map/map.component';
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
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'profile',   component: ProfileComponent },
    { path: 'table-list',     component: TableListComponent },
    { path: 'table-main',     component: TableMainComponent },
    { path:'login',             component:LoginComponent },
    { path: 'profilereport', component: ReportprofileComponent},
    { path: 'reportbuild', component: ReportuserbuildComponent},
    // { path:'login',             component:LoginComponent },
    { path: 'table-detail/:id', component: TableDetailComponent },
    { path: 'typography',       component: TypographyComponent },
    { path: 'icons',            component: IconsComponent },
    { path: 'signature',             component: SignatureComponent },
    { path: 'employee',    component: EmployeeComponent },
    { path: 'upgrade',          component: UpgradeComponent },
    { path: 'reportuser',         component:ReportuserComponent},
    { path: 'reportprofile', component:ReportprofileComponent},
    { path: 'map',             component:MapComponent},
];
