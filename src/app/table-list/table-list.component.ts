import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../services/shared.service"
import { DataTableDirective } from 'angular-datatables'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Items } from '../../../server/models/itemModel';
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import  html2canvas from 'html2canvas';
import { ElementContainer } from 'html2canvas/dist/types/dom/element-container';
import { Router } from '@angular/router';


@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  people:any[] =[];
  
  //ListUser: users[] =[];
  Form:FormGroup;
  dtOptions:any ={};
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;

  items:any= [];
  viewData=[];
  detailItems: any;
  PersonINT :number = 0;
  personInputs: FormArray;
  // currentRecordId: string;
  addItemForm: any;
  addDataForm: any;
  activeButton: string='';
  isTyproActive:boolean = false;
  isWritteActive:boolean = false;
  typroText: string='';
   typroTexts: { [key: string]: string } = {}; 
  uploadedImages: string[] = [];
  uploadedImageUrl: string | ArrayBuffer | null = null;
  isLoading: boolean[] = [];
  loadig:boolean = false;
  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private router: Router 
  ) { 
    this.addItemForm = this.fb.group({
      id: ['',Validators.required],
      startDate: ['',Validators.required],
      detail:['',Validators.required],
      endDate: ['',Validators.required],
      location: ['',Validators.required],
      topic: ['',Validators.required],
      personal: this.fb.array([]),
      

    }); 
    this.addPersonalForm = this.fb.group({
      rank: ['',Validators.required],
      fullname: ['',Validators.required],
    });
    
    this.personInputs = this.addItemForm.get('personal') as FormArray;
    this.addPersonInput(); // Add initial input group
    this.loadViewData();
    
  }
  documentImageUrl = 'assets/img/sampleA4-1.png';
  // itemsTest:any[]= [
  //   {
  //     id:'1', startDate:'20/05/2567',endDate:'26/05/2567',location:'data testing'
  //   },
  //   {
  //     id:'2', startDate:'30/05/2567',endDate:'01/06/2567',location:'data testing'
  //   }

  // ];
  fetchData() {
    this.fetchData;
    this.sv.getData().subscribe(
      res => {
        this.items = res.records; // ใช้ res.records แทน res
        console.log('Items fetched successfully:', this.items);
      },
      error => {
        console.error('Error fetching items:', error);
      }
    );
  } 


  ngOnInit() {

  
    // this.Form =this.fb.group({
    //   Full_name1: new FormControl(""),
    //   Full_name2: new FormControl(""),
    //   Full_name3: new FormControl("")
    // })
    this.dtOptions = {
    
      columnDefs: [
        {
          // targets: [5],
          // orderable: false
        }
      ],
      pagingType: 'full_numbers',
      "language": {
        "lengthMenu": "แสดง _MENU_ รายการ",
        "search": "ค้นหา"
        ,
        "info": "แสดงหน้า _PAGE_ จากทั้งหมด _PAGES_ หน้า",
        "infoEmpty": "แสดง 0 ของ 0 รายการ",
        "zeroRecords": "ไม่พบข้อมูล",
        "paginate": {
          "first": "หน้าแรก",
          "last": "หน้าสุดท้าย",
          "next": "ต่อไป",
          "previous": "ย้อนกลับ"
        },
      }
    };

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

    this.sv.getData().subscribe(res => {
      console.log("res getData:", res);
      this.items = res;
     
    });
    
    
  }



  setActive(button: string){
    this.activeButton = button;
    console.log("connented..Active")
    if (button === 'typro'){
      this.isTyproActive =true;
      this.isWritteActive =false;
      console.log("typro section")
      
    }else if(button ==="writte"){
      this.isTyproActive =false;
      this.isWritteActive =true;
      console.log("writte section..")
    }else{
      console.log("selection error")
    }
  }



  //หน้าจอรายละเอียดข้อมูล
  openModal(recordId: any) {

    $('#myModal').modal('show');  
   
    this.sv.getDataById(recordId).subscribe(res=>{
      console.log("getDataById :",res);
      
      this.detailItems =res;
    
      console.log("getData: ",res)

    })
    this.sv.getViewByRecordId(recordId).subscribe((res :any)=>{
      console.log("getDataById :",res);
      
      this.viewData = res;
    
      console.log("it on working.. ")
      
    })
  }


  loadViewData() {
    this.sv.getItems().subscribe(data => {
      this.viewData = data;
      this.isLoading = new Array(data.length).fill(false);
      this.uploadedImages = new Array(data.length).fill(null);
    });
  }

  uploadImage(index: number) {
    const fileInput = document.getElementById(`image-upload-${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.isLoading[index] = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImages[index] = e.target.result;
        this.isLoading[index] = false;
      };
      reader.readAsDataURL(file);
    }
  }


 addPersonModel(){
  $('#addPersonModel').modal('show');
 }


 addPersonInput(){
  console.log("connet..")
  this.PersonINT++;
  this.personInputs.push(this.createPersonGroup());
  // this.personInputs = Array(this.PersonINT).fill(1).map((x, i) => i);
  console.log(this.PersonINT);

  // const add = this.addItemForm.get("personal") as FormArray;
  // add.push(this.fb.group({
  //   rank: ['',Validators.required],
  //   fullname: ['',Validators.required],
  // }))
  
 }


 //petch สร้างการ Create ของ InputPerson นะ
 createPersonGroup(): FormGroup {
  return this.fb.group({
    rank: ['', Validators.required],
    fullname: ['', Validators.required]
  });
  
}
//รับค่าหลายตัว
get personal(): FormArray {
  return this.addItemForm.get('personal') as FormArray;
}

 addPersonCommit(value: any) {
  console.log("commit success", value);
  // ส่งข้อมูลไปยัง controller
  this.sv.postPersonData(value).subscribe(res => {
    console.log("res postPersonData:", res);
  });
}


  onRecord(){
    $('#writtenModel').modal('show'); // ใช้ jQuery เปิด modal
   
  
   
  }



//insert
  onInsert(){
    $('#insertModel').modal('show'); 
  }




  onInsertSummit(data) {
      
    // console.log(data);
    console.log('Item form:',this.addItemForm.value);
    console.log('PernalForm : ',this.addPersonalForm.value);
    console.log('Personal array form : ',this.personal.value)
    console.log("onInsertSubmit..?data : ",data);
    // console.log(this.addPersonalForm.value);
    if (this.addItemForm.invalid || this.personal.invalid ) {
      console.log('ฟอร์มไม่ถูกต้อง');
      // แสดงข้อความแสดงข้อผิดพลาดให้ผู้ใช้ดู
      Swal.fire({
        title: 'Error!',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่องที่จำเป็น.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
 
    // }
    // console.log(this.items);
    // ส่งข้อมูลไปยัง controller

    // this.sv.postItemData(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
    //   console.log("res postItemData:", res);
    // });

    
    this.sv.postDataTest(this.addItemForm.value).subscribe(res => {
      console.log("res submitted successfully", res);
      Swal.fire({
              title: 'Success!!',
              text: 'Your data has been submitted successfully.',
              icon: 'success',
              confirmButtonText: 'OK'
      });
      $('#insertModel').modal('hide');
      this.addItemForm.reset();
      this.personInputs.clear(); // Clear FormArray
      // this.addPersonInput();
    },
    error =>{
      console.error('Error submitting data:', error);
      Swal.fire({
            title: 'Error!',
            text: 'กรุณากรอกข้อมูลให้ครบทุกช่องที่จำเป็น.',
            icon: 'error',
            confirmButtonText: 'OK'
          });

    }
    

  );
    
  

     // Close the modal
     $('#insertModel').modal('hide');
        
     // Show success alert
  //    $('#insertModel').on('hidden.bs.modal', function () {
  //     Swal.fire({
  //       title: 'Success!!',
  //       text: 'Your data has been submitted successfully.',
  //       icon: 'success',
  //       confirmButtonText: 'OK'
  //   });
  // });
  // this.addItemForm.reset();

    this.fetchData()
    
    // if (this.addItemForm.valid) {
    //   this.items.push(this.addItemForm.value);
    //   this.addItemForm.reset();
    //   // console.log(this.items);
    //   // ส่งข้อมูลไปยัง controller
    //   this.sv.postItemData(this.items).subscribe(res => {
    //     console.log("res postItemData:", res);
    //   });
    // }
  }
  
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.addItemForm.patchValue({
          location:` Lat: ${lat}, Lng: ${lng}`
        });
      }, (error) => {
        console.error(error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
  //insert end here
  recordCommit(){
    this.sv.setTyproText(this.typroText);
    // Code to close this modal and open the second modal
    $('#writtenModel').modal('hide');
  }


  printPDF = () => {
    console.log("working PDF..");
    const elementToPrint = document.getElementById('myDetail');
    html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PDF', 0, 0, 210, 297);
        pdf.save('record.pdf');

        this.closeModal();
    });
    this.fetchData()
}

closeModal = () => {
    $('#myModal').modal('hide');
}
  

  searchData(data: string) {
    this.sv.searchData(data).subscribe(res => {
      console.log("res searchData:", res);
    });
  }
 
}
