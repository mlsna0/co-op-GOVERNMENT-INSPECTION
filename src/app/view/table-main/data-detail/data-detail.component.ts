import { Component, OnInit } from '@angular/core';
import { SharedService } from "../../../services/shared.service";
import {Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
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

  editItemForm: any;
  addPersonalForm: any;

  Submitted:boolean =false;
  constructor(
    private sv: SharedService,
    private fb:FormBuilder,
    private router: Router,
    private ACrouter: ActivatedRoute,
    private authService: AuthService
  ) {

    this.editItemForm = this.fb.group({
      id: ['',Validators.required],
      startDate: ['',Validators.required],
      detail:['',Validators.required],
      endDate: ['',Validators.required],
      location: ['',Validators.required],
      topic: ['',Validators.required],
      content:[''],
      filename: [''],
      place:['', Validators.required],
       personal: this.fb.array([])
  })
   this.addPersonalForm = this.fb.group({
    rank: ['',Validators.required],
    firstname: ['',Validators.required],
    lastname: ['',Validators.required],
  }); //ช้อมูลไม่ได้มาด้วยนะ

  // (this.editItemForm.get('personal') as FormArray).push(this.addPersonalForm);
   }

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
      const formattedStartDate = this.DataDetail?.record_star_date ? new Date(this.DataDetail.record_star_date).toISOString().split('T')[0] : null;
      const formattedEndDate = this.DataDetail?.record_end_date ? new Date(this.DataDetail.record_end_date).toISOString().split('T')[0] : null;

      this.editItemForm.patchValue({
        id: this.DataDetail?.record_id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        topic:this.DataDetail?.record_topic ,
        detail:this.DataDetail?.record_detail,
        content:this.DataDetail?.record_content,
        place:this.DataDetail?.record_place,
        location: this.DataDetail?.record_location,
        
       
        filename:this.DataDetail?.record_filename 
       
     
      
      })

    });


    this.sv.getViewByRecordId(this.recordId).subscribe((res: any) => {
      console.log("Response from API:", res);
      this.viewPersonalData =res;
    
      if (res && Array.isArray(res)) {
        const personalArray = this.addPersonalForm.get('personal') as FormArray;
    
        // Clear existing FormArray controls
        personalArray.clear();
    
        // Loop through the array of data and add a new FormGroup for each item
        res.forEach((item: any) => {
          const group = this.fb.group({
            rank: [item.view_rank || '', Validators.required],
            firstname: [item.view_first_name || '', Validators.required],
            lastname: [item.view_last_name || '', Validators.required],
          });
          personalArray.push(group);
        });
    
        console.log("Updated personal FormArray:", personalArray.value);
      } else {
        console.error("No data found or unexpected data format.");
      }
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
  openEditModal(){
    $('#EditModal').modal({
      backdrop: 'static', 
      keyboard: false    
    });
    $('#EditModal').modal('show');
  }
  onEditDataSubmit(){

  }
  closeModal() {
    $('#EditModal').modal('hide');
    // รีเฟรชหน้าจอ
    this.refreshPage();
  }
  refreshPage() {
    window.location.reload();
  }

}
