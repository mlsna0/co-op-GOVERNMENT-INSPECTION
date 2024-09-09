import { Component, OnInit } from '@angular/core';
import { SharedService } from "../../../services/shared.service";
import {Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
 //การจะใช้ thaidate ให้มีการไปเชื่อมกับ admin-layout หรือ สถานที่อ้างถึง

@Component({
  selector: 'app-data-detail',
  templateUrl: './data-detail.component.html',
  styleUrls: ['./data-detail.component.css']
})
export class DataDetailComponent implements OnInit {

  currentUser:any;
  RoleCurrenUser:any;


  recordId: any;
  DataDetail:any ={};
  viewPersonalData:any[] =[];
  createDocData: any={};

  editItemForm: any;
  addPersonalForm: any;

  PersonINT :number = 0;
  personInputs: FormArray;

  Submitted:boolean =false;
  constructor(
    private sv: SharedService,
    private router: Router,
    private ACrouter: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder,
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
  });
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
      console.log("getDataById :", res);

      this.viewPersonalData = res;
      if (res && Array.isArray(res)) {
        const personalArray = this.editItemForm.get('personal') as FormArray;
    
        // Clear existing FormArray controls
        personalArray.clear();
    
        // Loop through the array of data and add a new FormGroup for each item
        res.forEach((item: any) => {
          const personalFormGroup = this.fb.group({
            _id: [item._id || ''], 
            rank: [item.view_rank || '', Validators.required],
            firstname: [item.view_first_name || '', Validators.required],
            lastname: [item.view_last_name || '', Validators.required],
          });
          personalArray.push(personalFormGroup);
        });
    
        console.log("Updated personal FormArray:", personalArray.value);
      } else {
        console.error("No data found or unexpected data format.");
      }

    });

    const targetDocumentId = this.recordId; ;

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

    this.getCurrentUser();
    
    
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
  getCurrentUser(): void {
    // ดึงข้อมูลจาก localStorage
    const userData = localStorage.getItem('currentUser');
  
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (userData) {
      // แปลง JSON เป็นวัตถุ
      this.currentUser = JSON.parse(userData);
      this.RoleCurrenUser = this.currentUser?.role;
  
      // console.log("currentUser: ",this.currentUser);
      console.log("this RoleCurrenUser : ", this.RoleCurrenUser);
    } else {
      console.log('No user data found in localStorage.');
    }
  }
  
  





  createPersonGroup(): FormGroup {
    return this.fb.group({
      rank: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required]
      // fullname: ['', Validators.required]
    });
    
  }
  addPersonInput(){
    console.log("connet..")
    if (this.PersonINT < 4) {
      this.PersonINT++;
      const personalArray = this.personal; // ใช้ this.personal แทน this.personInputs
      personalArray.push(this.fb.group({
        rank: ['', Validators.required],
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
      }));
      console.log("Person count:", this.PersonINT);
    } else {
      alert("เพิ่มการกรอกข้อมูลผู้ตรวจได้สูงสุด 4 คน");
    }
    
   }
  
  get personal(): FormArray {
    return this.editItemForm.get('personal') as FormArray;
  }
   deletePersonInput() {
    if (this.PersonINT > 0) {
      this.PersonINT--;
      this.personal.removeAt(this.personal.length - 1); // ใช้ this.personal แทน this.personInputs
    }
    console.log("Person count after delete:", this.PersonINT);
   }
  
   canAddPerson(): boolean {
    const personalArray = this.personal;
   return personalArray.length < 4; 
  }

  //submit //////////////////////////////////////////////////////
  onEditDataSubmit(){
    this.Submitted = true; 
    
    if(this.editItemForm.invalid){
      alert('Form is invalid');
    return;
    }
    const formData = this.editItemForm.value;
    formData._id = this.DataDetail._id;
    console.log("DATA for update/edit: ",formData)
    this.sv.updateDataDocument(formData).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        // ปิดโมเดลหรือแสดงข้อความสำเร็จ
      },
      error: (error) => {
        console.error('Update failed:', error);
        // แสดงข้อความข้อผิดพลาด
      }
    });

  }
  
///////////////////////////////////////////////////////////////////
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

  closeModal() {
    $('#EditModal').modal('hide');
    // รีเฟรชหน้าจอ
    this.refreshPage();
  }
  refreshPage() {
    window.location.reload();
  }

}
