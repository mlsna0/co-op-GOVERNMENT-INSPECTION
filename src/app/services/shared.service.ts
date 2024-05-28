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
  private typroText: any = {};
  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/data`).pipe(
      catchError(error=>{
        console.error('Error fatching data:',error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }
  getDataById(id: number): Observable<any>{
    return this.http.get(`${this.baseUrl}/recordModel/${id}`);
  }
  

  getAggregatedData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aggregateRecordsAndView`).pipe(
      catchError(error => {
        console.error('Error fetching aggregated data:', error);
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

  // postDataTest(data:any,){
  //   console.log("DATA : ",data)
  //   let formData = new FormData
  //   formData.append("endDate",data.endDate)
  //   formData.append("id",data.id)
  //   formData.append("location",data.location)
  //   formData.append("startDate",data.startDate)
  //   formData.append("topic",data.topic)
  //   formData.append("detail",data.detail)
  // //   for (let person of personal) {
  // //     formData.append("personal[]", JSON.stringify(person));
  // // }
  //   return this.http.post(`${this.baseUrl}/postDataTest/`,data);
  // }

  postItemData(data: any): Observable<any> {
    const formattedData = {
      id: data.id,
      startDate: data.startDate,
      endDate: data.endDate,
      detail: data.detail,
      location: data.location,
      topic: data.topic,
      fullname: data.personal // เปลี่ยนชื่อฟิลด์จาก personal เป็น fullname
    };
    return this.http.post(`${this.baseUrl}/postItemData`, formattedData);
  }

  searchData(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchData?query=${query}`);
  }
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items`);
  }
  setTyproText(text: string) {
    this.typroText = text;
  }
  getTyproText(): string {
    return this.typroText;
  }
}
