import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, map, throwError } from 'rxjs';

import * as pdfjsLib from 'pdfjs-dist';
import { HttpClient } from '@angular/common/http';

interface ProvinceData {
  name_th: string;
  id: number;
  name: string;
  count: number;
  percentage: number;
  signedDocuments: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  
   ///land add(pdf count)//
  constructor(private http: HttpClient) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  private apiUrl = 'http://localhost:3000/api'; // แทนที่ด้วย URL ของ API ที่คุณสร้าง 
   ///land add(pdf count) end...///

  private provincesSubject = new BehaviorSubject<ProvinceData[]>([]);
  private totalDocumentsSubject = new BehaviorSubject<number>(0);
  private totalSignedDocumentsSubject = new BehaviorSubject<number>(0);

  provinces$ = this.provincesSubject.asObservable();
  totalDocuments$ = this.totalDocumentsSubject.asObservable();
  totalSignedDocuments$ = this.totalSignedDocumentsSubject.asObservable();

  setProvinces(provinces: ProvinceData[]) {
    this.provincesSubject.next(provinces);
  }

  setTotalDocuments(total: number) {
    this.totalDocumentsSubject.next(total);
  }

  setTotalSignedDocuments(total: number) {
    this.totalSignedDocumentsSubject.next(total);
  }

  private userCountSubject = new BehaviorSubject<number>(0);

  userCount$ = this.userCountSubject.asObservable();

  updateUserCount(userCount: number): void {
    // console.log("Received user count:", userCount);
    this.userCountSubject.next(userCount);
  }
  private signedDocumentsCountSubject = new BehaviorSubject<number>(0); 

  signedDocumentsCount$ = this.signedDocumentsCountSubject.asObservable();

  updateSignedDocumentsCount(signedDocumentsCount: number): void {
    // console.log("Received signed documents count:", signedDocumentsCount);
    this.signedDocumentsCountSubject.next(signedDocumentsCount);
  }
  private totalDocumentsCountSubject = new BehaviorSubject<number>(0);

  totalDocumentsCount$ = this.totalDocumentsCountSubject.asObservable();

  updateTotalDocumentsCount(totalDocumentsCount: number): void {
    // console.log("Received total documents count:", totalDocumentsCount);
    this.totalDocumentsCountSubject.next(totalDocumentsCount);
  }

   // BehaviorSubject สำหรับนับจำนวนบริษัท
   private companyCountSubject = new BehaviorSubject<number>(0);

   companyCount$ = this.companyCountSubject.asObservable();
 
 updateCompanyCount(companyCount: number): void {
    console.log("Received company count:", companyCount);
    this.companyCountSubject.next(companyCount);
  }
  getTotalCompanies(): Observable<any>{
    return this.http.get<any[]>(`${this.apiUrl}/agencyModel`).pipe(
      map(records => records.length), // นับจำนวนเอกสาร
      catchError(error => {
        // console.error('Error fetching data:', error);
        throw 'ไม่สามารถดึงข้อมูลได้';
      })
    );
  }


 ///land add(pdf count)///

 getPdfFiles(): Observable<string[]> {
  return this.http.get<string[]>(this.apiUrl).pipe(
    catchError(error => {
      console.error('Error fetching PDF files:', error); // เพิ่มการจัดการข้อผิดพลาด
      return throwError(error);
    })  
  );
}

getPdfPageCount(pdfUrl: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    pdfjsLib.getDocument(pdfUrl).promise.then((pdfDoc: any) => {
      resolve(pdfDoc.numPages);
    })
  });
}

async getTotalPagesCount(pdfUrls: string[]): Promise<number> {
  let totalPageCount = 0;
  for (const url of pdfUrls) {
    try {
      const pageCount = await this.getPdfPageCount(url);
      totalPageCount += pageCount;
    } catch (error) {
      console.error('Failed to load PDF:', url, error);
    }
  }
  return totalPageCount;
}



// getTotalPdfPages(): Observable<{ totalPages: number }> {
//   return this.http.get<{ totalPages: number }>('/api/pdf-page-count');
// }

 ///land add(pdf count) end...///
}