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
}