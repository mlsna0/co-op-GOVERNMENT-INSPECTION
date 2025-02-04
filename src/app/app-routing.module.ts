import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableListComponent } from 'app/table-list/table-list.component';
import { TypographyComponent } from 'app/typography/typography.component';
import { IconsComponent } from 'app/icons/icons.component';
import { SignatureComponent } from 'app/signature/signature.component';
// import { EmployeeComponent } from '../../employee/employee.component';
// import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { TableDetailComponent } from 'app/view/table-detail/table-detail.component';
import {TableMainComponent } from 'app/view/table-main/table-main.component';
import {DataDetailComponent } from 'app/view/table-main/data-detail/data-detail.component';
import { LoginComponent } from 'app/layouts/auth-layout/login/login.component';
import { DashboardComponent } from 'app/view/dashboard/dashboard.component';
import { ProfileComponent} from 'app/view/profile/profile.component';
import { ReportuserComponent } from 'app/view/reportuser/reportuser.component';
import { ReportuserbuildComponent } from 'app/view/reportuser/reportuserbuild/reportuserbuild.component';
import { ManageuserComponent } from 'app/view/manageuser/manageuser.component';
import { ProfileuserComponent } from 'app/view/manageuser/profileuser/profileuser.component';
import { AuthGuard } from 'app/layouts/auth-layout/auth.guard'; // นำเข้า AuthGuard ของคุณ
import { MapComponent } from 'app/view/map/map.component';
const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'table-list', component: TableListComponent, canActivate: [AuthGuard] },
  { path: 'table-main', component: TableMainComponent, canActivate: [AuthGuard] },
  { path: 'data-detail/:id', component: DataDetailComponent, canActivate: [AuthGuard] },
  { path: 'reportbuild', component: ReportuserbuildComponent, canActivate: [AuthGuard] },
  { path: 'manageuser', component: ManageuserComponent, canActivate: [AuthGuard] },
  { path: 'profileuser', component: ProfileuserComponent, canActivate: [AuthGuard] },
  { path: 'profileuser/:id', component: ProfileuserComponent, canActivate: [AuthGuard] },
  { path: 'table-detail/:id', component: TableDetailComponent, canActivate: [AuthGuard] },
  { path: 'typography', component: TypographyComponent, canActivate: [AuthGuard] },
  { path: 'icons', component: IconsComponent, canActivate: [AuthGuard] },
  { path: 'signature', component: SignatureComponent, canActivate: [AuthGuard] },
  // { path: 'employee', component: EmployeeComponent, canActivate: [AuthGuard] },
  // { path: 'upgrade', component: UpgradeComponent, canActivate: [AuthGuard] },
  { path: 'reportuser', component: ReportuserComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }, // เส้นทางล็อกอินไม่ต้องใช้ AuthGuard
  { path: '**', redirectTo: 'login' } // Redirect ไปยังหน้า login ถ้าเส้นทางไม่ตรงกับที่กำหนด
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }