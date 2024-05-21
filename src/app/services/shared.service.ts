import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
import { Observable, catchError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // private baseUrl = 'mongodb://127.0.0.1:27017/Angular-Project'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private baseUrl = 'http://localhost:3000/api'; // ปรับ URL ให้ตรงกับ API ของคุณ

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getData`).pipe(
      catchError(error=>{
        console.error('Error fatching data:',error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }

  postData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postData`, data);
  }

  postPersonData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postItemData`, data);
  }

  postDataTest(data:any){
    console.log("DATA : ",data)
    let formData = new FormData
    formData.append("endDate",data.endDate)
    formData.append("id",data.id)
    formData.append("location",data.location)
    formData.append("startDate",data.startDate)
    formData.append("topic",data.topic)
    formData.append("detail",data.detail)
    formData.append("fullname",data.fullname)  //petch add this code

    return this.http.post(`${this.baseUrl}/postDataTest/`,formData);
  }

  postItemData(data: any,personal:any): Observable<any> {
  
    // console.log('data in service post item',data);
    // console.log('personal in service ',personal);

    const formData :any={
      item: data,
      personal: personal
    }
    console.log("URL ",this.baseUrl)
    
    return this.http.post(`${this.baseUrl}/postItemData`,formData);
  }

  searchData(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchData?query=${query}`);
  }
}
