import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

export const AuthLayoutRoutes: Routes = [
  
    { path: 'login',      component: LoginComponent },
    { path: 'register',      component: RegisterComponent },
    { path: 'forget-password',      component: ForgetPasswordComponent },
    

    // {
    //     path: 'admin',
    //     component: AdminComponent,
    //     canActivate: [AuthGuard],
    //     data: { role: 'admin' }
    //   },
    //   {
    //     path: 'superadmin',
    //     component: SuperAdminComponent,
    //     canActivate: [AuthGuard],
    //     data: { role: 'superadmin' }
    //   },
    //   {
    //     path: 'user',
    //     component: UserComponent,
    //     canActivate: [AuthGuard],
    //     data: { role: 'user' }
    //   },

];
