import { HttpClient, HttpClientModule } from '@angular/common/http';
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

  login(email: string, password: string): Observable<any> {
    console.log("email",email)
    console.log("password",password)
    return this.http.post(`${this.baseUrl}/registerModel/login`, { email, password }).pipe(
      catchError(error => {
        console.error('Error logging in:', error);
        return throwError('Invalid email or password');
      })
    );
  }

}
