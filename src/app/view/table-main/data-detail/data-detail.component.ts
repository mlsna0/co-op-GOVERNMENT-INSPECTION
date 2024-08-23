import { Component, OnInit } from '@angular/core';
import { SharedService } from "../../../services/shared.service";
import {Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
 //การจะใช้ thaidate ให้มีการไปเชื่อมกับ admin-layout หรือ สถานที่อ้างถึง

@Component({
  selector: 'app-data-detail',
  templateUrl: './data-detail.component.html',
  styleUrls: ['./data-detail.component.css']
})
export class DataDetailComponent implements OnInit {

  recordId: any;
  DataDetail:any ={};
  viewPersonalData:any[] =[];
  createDocData: any={};
  constructor(
    private sv: SharedService,
    private router: Router,
    private ACrouter: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.ACrouter.paramMap.subscribe(params => {
      this.recordId = params.get('id');

      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log("recordID it send? >",this.recordId); // ทดสอบการดึงค่า id
    });

    this.sv.getDataById(this.recordId).subscribe(res => {
      console.log("getDataById :", res);

      this.DataDetail = res;
      console.log("data detail",this.DataDetail)

    });

    this.sv.getViewByRecordId(this.recordId).subscribe((res: any) => {
      console.log("getDataById :", res);

      this.viewPersonalData = res;

    });
    const targetDocumentId = this.recordId; 
    this.sv.getRecordByDocumentId(targetDocumentId).subscribe(data => {
      if (data && data.document && data.user && data.employee) {
        const mergedData = this.mergeUserData(data.employee, data.user, data.document);
        this.createDocData = mergedData.reverse();
        console.log("create data: ", this.createDocData);
      } else {
        console.error('Data is incomplete or invalid:', data);
      }
    }, error => {
      console.error('Error fetching user data:', error);
    });
    
    
  }

  
  mergeUserData(employee: any, user: any, document: any): any {
    if (!document || !user || !employee) {
      console.error('Incomplete data:', { document, user, employee });
      return [];
    }
  
    return [{
      documentId: document.documentId,
      record_topic: document.record_topic,
      createdDate: document.createdDate,
      createdTime: document.createdTime,
      firstname: employee.firstname || 'N/A',
      lastname: employee.lastname || 'N/A',
      email: employee.email || 'N/A',
      role: user.role || 'N/A'
    }];
  }
  
  

  BackRoot(){
    this.router.navigate(['/table-main']);
  }

}
