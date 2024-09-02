import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
    console.log("Received user count:", userCount);
    this.userCountSubject.next(userCount);
  }
  private signedDocumentsCountSubject = new BehaviorSubject<number>(0); 

  signedDocumentsCount$ = this.signedDocumentsCountSubject.asObservable();

  updateSignedDocumentsCount(signedDocumentsCount: number): void {
    console.log("Received signed documents count:", signedDocumentsCount);
    this.signedDocumentsCountSubject.next(signedDocumentsCount);
  }
  private totalDocumentsCountSubject = new BehaviorSubject<number>(0);

  totalDocumentsCount$ = this.totalDocumentsCountSubject.asObservable();

  updateTotalDocumentsCount(totalDocumentsCount: number): void {
    console.log("Received total documents count:", totalDocumentsCount);
    this.totalDocumentsCountSubject.next(totalDocumentsCount);
  }
}