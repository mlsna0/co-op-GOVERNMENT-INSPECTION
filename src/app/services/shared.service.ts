import { HttpClient, HttpClientModule,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
import { Observable, catchError,map,BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class SharedService {

  

  // private baseUrl = 'mongodb://127.0.0.1:27017/Angular-Project'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private baseUrl = 'http://localhost:3000/api'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private tokenKey = 'token';

  private profileImageUrl = new BehaviorSubject<string>('./assets/img/Person-icon.jpg');
  currentProfileImageUrl = this.profileImageUrl.asObservable();
  private typroText: string = '';
  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/data`).pipe(
      catchError(error=>{
        console.error('Error fatching data:',error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }
  getRecord():Observable<any>{
    return this.http.get(`${this.baseUrl}/recordModel`).pipe(
      catchError(error=>{
        console.error('Error fatching data:',error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }
  getRecordCount(): Observable<number> {
    return this.http.get<any[]>(`${this.baseUrl}/recordModel`).pipe(
      map(records => records.length), // นับจำนวนเอกสาร
      catchError(error => {
        console.error('Error fetching data:', error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }
  getDataById(id: number): Observable<any>{
    return this.http.get(`${this.baseUrl}/recordModel/${id}`);
  }
  getViewByRecordId(record_id){
    return this.http.get(`${this.baseUrl}/viewModel/getViewByRecordId/${record_id}`);
  }

  getAggregatedData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aggregateRecordsAndView`).pipe(
      catchError(error => {
        console.error('Error fetching aggregated data:', error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }

  postTyproText(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/postTyproText`, data);
  }
  getTyproText(record_id){
    return this.http.get(`${this.baseUrl}/dtModel/getTyproText/${record_id}`);
  }
  
  updateRecordContent(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/record/updateContent`, data).pipe(
      catchError(error => {
        console.error('Error updating record content:', error);
        throw 'ไม่สามารถอัปเดตข้อมูลได้';
      })
    );
  }
  savePDF(data: FormData): Observable<any> {
    console.log('Data:',data);
    
    return this.http.put(`${this.baseUrl}/record/savepdf`, data).pipe(
      catchError(error => {
        console.error('Error saving PDF:', error);
        throw 'ไม่สามารถบันทึก PDF ได้';
      })
    );
  }
  getPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf/${id}`, { responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error fetching PDF:', error);
        throw 'ไม่สามารถดึง PDF ได้';
      })
    );
  }
  
  

  postData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postData`, data);
  }

  postPersonData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/postItemData`, data);
  }

  postDataTest(data:any ){
    const token = localStorage.getItem('token');  // ดึง token จาก localStorage หรือที่เก็บอื่น ๆ
    const headers = new HttpHeaders().set('Authorization', ` ${token}`);
   
    console.log("DATA : ",data)
  const jsonPayload = {
         id: data.id,
         startDate: data.startDate,
         endDate: data.endDate,
         detail: data.detail,
         location: data.location,
         topic: data.topic,
         content: data.content,
         filename: data.filename,
         place: data.place,
         personal: data.personal,
         createdBy: data.createdBy
  };
 
  console.log("jasonPayload Data: ",jsonPayload)
    return this.http.post(`${this.baseUrl}/postDataTest/`,jsonPayload ,{ headers });
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
  // getItems(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/items`);
  // }
  getUserReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/registerModel`);
  }
  updateUserProfile(updatedData:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/registerModel`, updatedData);
  }
  profileImg(url:string){
    this.profileImageUrl.next(url);
  }

}
