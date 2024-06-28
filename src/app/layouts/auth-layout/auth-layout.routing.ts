import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

export const AuthLayoutRoutes: Routes = [
  
    { path: 'login',      component: LoginComponent },
    { path: 'register',      component: RegisterComponent },
    { path: 'forget-password',      component: ForgetPasswordComponent },
    
];
