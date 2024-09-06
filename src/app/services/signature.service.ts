import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  // Node/Express API
  // REST_API: string = 'https://doc.oca.go.th/api'
  REST_API: string = 'http://localhost:3000/api'

  
  // Http header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json')

  constructor(private httpClient: HttpClient) { }

  signature(formData) {
    console.log("Form Data:", formData);
    
    let API_URL = `${this.REST_API}/stampSignature`
    return this.httpClient.post(`${API_URL}`, formData)
  }
}
