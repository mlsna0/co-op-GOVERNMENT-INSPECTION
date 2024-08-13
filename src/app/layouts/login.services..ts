import { HttpClient, HttpClientModule,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
import { Observable, catchError, forkJoin, throwError } from 'rxjs';
import { SharedService } from 'app/services/shared.service';




@Injectable({
  providedIn: 'root'
})
export class loginservice {

  

  // private baseUrl = 'mongodb://127.0.0.1:27017/Angular-Project'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private baseUrl = 'http://localhost:3000/api'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private tokenKey = 'token';
 
  constructor(private http: HttpClient,private sv:SharedService) { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }


  ///////////////////////////////////////////////////////////////////////////


 
  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/registerModel`, formData);
  }
  
  updateProfile(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/registerModel/updateProfile`, userData).pipe(
      catchError(error => {
        console.error('Error updating profile:', error);
        return throwError('ไม่สามารถอัปเดตโปรไฟล์ได้');
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
    return this.http.post(`${this.baseUrl}/registerModel/resetPassword`, { email, password });

  }

  getUserReport(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/allusers`);
  }



  getUserProfile(): Observable<any> {
    const token = localStorage.getItem(this.tokenKey);
   
    if (!token) {
      console.error('No token found in localStorage');
      return throwError('No token found');
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/registerModel/profile`, { headers })
    .pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(error);
      })
    );
  
  }

  // getUserProfileฺฺById(id:number): Observable<any>{
  //   return this.http.get<any>(`${this.baseUrl}/registerModel/profile/${id}`)
  // }
  
  getUserReportProfile(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/registerModel/${userId}`);
  }
  
  handleLoginResponse(response: any): void {
    const token = response.token;
    this.sv.setToken(token); // เก็บ token ใน LocalStorage ผ่าน TokenService
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/registerModel/updateRole/${userId}`, { role })
      .pipe(
        catchError(error => {
          console.error('Error updating role:', error);
          return throwError('Error updating role');
        })
      );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/registerModel/${userId}`);
  }


  uploadProfileImage(userId: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('profileImage', file, file.name);

    const token = localStorage.getItem(this.tokenKey);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.baseUrl}/registerModel/uploadProfile/${userId}`, formData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error uploading profile image:', error);
          return throwError('Failed to upload profile image');
        })
      );
  }

}
