import { HttpClient, HttpClientModule,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
import { Observable, catchError, forkJoin, tap, throwError } from 'rxjs';
import { SharedService } from 'app/services/shared.service';
import { log } from 'console';




@Injectable({
  providedIn: 'root'
})
export class loginservice {


  

  // private baseUrl = 'mongodb://127.0.0.1:27017/Angular-Project'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private baseUrl = 'http://localhost:3000/api'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private tokenKey = 'token';
 
  constructor(private http: HttpClient,private sv:SharedService) { }
  
  isLoggedIn(): boolean {
    const token = this.getToken();
    // เพิ่มการตรวจสอบว่า token ยังไม่หมดอายุ หรือยังเป็น valid อยู่
    return !!token;
  }
  getCurrentUser(): any {
    // ดึงข้อมูลจาก localStorage
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  
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
    console.log("data in formdata", formData)
    return this.http.post(`${this.baseUrl}/registerModel`, formData);
  }

  getuserregister(): Observable<any> {
    return this.http.get(`${this.baseUrl}/registerModel`);
  }

  agency(formData: FormData): Observable<any> {
    console.log("data in formdata", formData)
    return this.http.post(`${this.baseUrl}/createagency`, formData);
  }

  getagency(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agencyModel`);
  }

  

  // agency(data: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/createagency`, data);
  // }
  

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
    console.log('getUserReport called'); // ตรวจสอบว่าฟังก์ชันถูกเรียกใช้งาน
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
       // tap(data => console.log('Data from API:', data)), // เพิ่มการตรวจสอบข้อมูลที่ได้รับ
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
    return this.http.get<any[]>(`${this.baseUrl}/userModel`);
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
  changePassword(oldPassword: string, newPassword: string, confirmPassword: string, userIdToReset?: string): Observable<any> {
    const body = { oldPassword, newPassword, confirmPassword, userIdToReset };
    console.log('Request Body:', body);
    
    const token = this.getToken();
    if (!token) {
        console.error('No token found');
        return throwError('No token found');
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Headers:', headers);
    
    return this.http.put(`${this.baseUrl}/registerModel/resetPassword`, body, { headers }).pipe(
        catchError(error => {
            console.error('Error changing password:', error); // ดูรายละเอียดเพิ่มเติมใน error response
            return throwError('Failed to change password');
        })
    );
}
resetUserPassword(userIdToReset: string): Observable<any> {
  const url = `${this.baseUrl}/userModel/resetPassword`;
  const body = { userIdToReset: userIdToReset };
  const token = localStorage.getItem(this.tokenKey);

  if (!token) {
    console.error('No token found');
    return throwError('No token found');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.put(url, body, { headers }).pipe(
    catchError(error => {
      console.error('Error resetting user password:', error);
      return throwError('Failed to reset user password');
    })
  );
}

}

