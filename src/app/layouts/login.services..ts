import { HttpClient, HttpClientModule,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class loginservice {

  

  // private baseUrl = 'mongodb://127.0.0.1:27017/Angular-Project'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private baseUrl = 'http://localhost:3000/api'; // ปรับ URL ให้ตรงกับ API ของคุณ
 
  constructor(private http: HttpClient) { }

 
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/registerModel`, userData).pipe(
      catchError(error => {
        console.error('Error registering user:', error);
        throw 'ไม่สามารถลงทะเบียนผู้ใช้ได้';
      })
    );
  }

  login(email: string, password: string, role: string ): Observable<any> {
    console.log("email",email)
    console.log("password",password)
    console.log("role",role)
    return this.http.post(`${this.baseUrl}/registerModel/login`, { email, password ,role}).pipe(
      catchError(error => {
        console.error('Error logging in:', error);
        return throwError('Invalid email or password');
      })
    );
  }

  resetPassword(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}//registerModel/resetPassword`, { email, password });

  }

  getUserReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/registerModel`);
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return throwError('No token found');
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/registerModel/profile`, { headers });
  }
  getUserReportProfile(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/registerModel/:id`);
  }

}
