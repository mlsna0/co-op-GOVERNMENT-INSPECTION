import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private baseUrl = 'mongodb://localhost:27017/Angular-Project'; // ปรับ URL ให้ตรงกับ API ของคุณ

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getData`);
  }

  postData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postData`, data);
  }

  postPersonData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postPersonData`, data);
  }

  postItemData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postItemData`, data);
  }

  searchData(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchData?query=${query}`);
  }
}
