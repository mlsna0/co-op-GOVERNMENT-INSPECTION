import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'your-api-endpoint'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  setTyproText(text: string, userId: number): Observable<any> {
    const url = `${this.apiUrl}/setTyproText`; // Adjust endpoint as needed
    const body = { text, userId };
    return this.http.post<any>(url, body);
  }
}
