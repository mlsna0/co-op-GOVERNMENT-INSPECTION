
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private baseUrl = 'http://localhost:3000/api'; // ปรับ URL ให้ตรงกับ API ของคุณ
  private tokenKey = 'token';

  private profileImageUrl = new BehaviorSubject<string>('./assets/img/Person-icon.jpg');
  currentProfileImageUrl = this.profileImageUrl.asObservable();
  private typroText: string = '';

  // BehaviorSubject สำหรับเก็บจำนวนปุ่มที่ถูกแสดง
  
  private buttonCountSource = new BehaviorSubject<number>(0);
  buttonCount$ = this.buttonCountSource.asObservable();

  updateButtonCount(count: number) {
    this.buttonCountSource.next(count);
  }

  constructor(private http: HttpClient) { }


  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
  
  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/data`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }

  // ฟังก์ชันอื่นๆ ที่คุณมีใน SharedService
  getRecord(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recordModel`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
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

  getViewByRecordId(record_id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/viewModel/getViewByRecordId/${record_id}`);
  }
  getRecordWithUserAndEmployee(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/recordModel/getuser/${userId}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
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

  getTyproText(record_id: number): Observable<any> {
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

  postDataTest(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/postDataTest/`, data, { headers }).pipe(
      catchError(error => {
        console.error('Error submitting data:', error);
        throw 'ไม่สามารถส่งข้อมูลได้';
      })
    );
  }

  postItemData(data: any, personal: any): Observable<any> {
    const formData: any = {
      item: data,
      personal: personal
    };
    return this.http.post(`${this.baseUrl}/postItemData`, formData);
  }

  searchData(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchData?query=${query}`);
  }

  getUserReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/registerModel`);
  }

  updateUserProfile(updatedData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/registerModel`, updatedData);
  }
  profileImg(url:string){
    this.profileImageUrl.next(url);
  }

}
