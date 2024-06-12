import { Component, OnInit, Renderer2, HostListener, QueryList  } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../services/shared.service"
import { DataTableDirective } from 'angular-datatables'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { DataTablesModule } from "angular-datatables"; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Items } from '../../../server/models/itemModel';
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import  html2canvas from 'html2canvas';
import { ElementContainer } from 'html2canvas/dist/types/dom/element-container';

import { ElementRef,ViewChild,ViewChildren,OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import moment from 'moment';


@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  @ViewChildren('writteSignElement') writteSignElement!: ElementRef;
  @ViewChild('textArea') textArea: ElementRef;
  
  people:any[] =[];
  
  //ListUser: users[] =[];
  Form:FormGroup;
  dtOptions:any ={};
  dtTrigger: Subject<any> = new Subject(); 
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;
  items:any= [];
  viewData=[];
  detailItems: any;
  PersonINT :number = 0;
  personInputs: FormArray;
  addItemForm: any;
  addDataForm: any;

  addNoteForm : any;

  activeButton: string='typro';
  isTyproActive:boolean = true;
  isWritteActive:boolean = false;
  typroText: string='';
  uploadedImages: string[] = [];
  isLoading: boolean[] = [false];
  // uploadedImageUrl: string | ArrayBuffer | null = null;
  // isLoading: boolean = false;
  
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  penColor: string = 'black';
  penSize: number = 1;
  
  ////////////////////////////
  isSignModalVisible: boolean[] = [];
  private canvas2: HTMLCanvasElement;
  private ctx2: CanvasRenderingContext2D;
  penColor2: string = 'black';
  penSize2: number = 1;
  showForm: boolean = false;
  event: Event;
  showPDF: boolean = false;


//writter box
  constructor(
    private fb:FormBuilder,
    private http:HttpClient,  
    private sv:SharedService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2, 
    private el: ElementRef
  ) { 
    this.addItemForm = this.fb.group({
      id: ['',Validators.required],
      startDate: ['',Validators.required],
      detail:['',Validators.required],
      endDate: ['',Validators.required],
      location: ['',Validators.required],
      topic: ['',Validators.required],
      personal: this.fb.array([])
    }); 
    this.addPersonalForm = this.fb.group({
      rank: ['',Validators.required],
      fullname: ['',Validators.required],
    });
    
    this.personInputs = this.addItemForm.get('personal') as FormArray;
    this.addPersonInput(); // Add initial input group
    // this.loadViewData();
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
 
  ngOnInit(){
    this.dtOptions = {
    
      // columnDefs: [
      //   {
      //     // targets: [5],
      //     // orderable: false
      //   }
      // ],
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
    console.log("DataTable : ",this.dtOptions)

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });

    this.sv.getData().subscribe(res => {
      console.log("res getRecord:", res);
      this.items = res;
     
    });
    
    // this.fetchData()

  }

  // fetchData() {
  //   this.sv.getData().subscribe(
  //     res => {
  //       this.items = res.records;
  //       this.dtTrigger.next(null); // แจ้งเตือน DataTable ว่ามีข้อมูลใหม่
  //       console.log('Items fetched successfully:', this.items);
  //     },
  //     error => {
  //       console.error('Error fetching items:', error);
  //     }
  //   );
  // }

  // ngOnDestroy() {
  //   this.dtTrigger.unsubscribe();
  // }

  // fetchData() {
  //   this.fetchData;
  //   this.sv.getData().subscribe(
  //     res => {
  //       this.items = res.records; // ใช้ res.records แทน res
  //       console.log('Items fetched successfully:', this.items);
  //     },
  //     error => {
  //       console.error('Error fetching items:', error);
  //     }
  //   );
    
  // } 
 

  //Writter section
  ngAfterViewInit() {
    this.setupCanvas();
    // this.setupSignCanvas(index: number);
  }
  setupSignCanvas(index: number) {
    this.canvas2 = document.getElementById(`writteSignCanvas-${index}`) as HTMLCanvasElement;
    if (this.canvas2) {
      this.ctx2 = this.canvas2.getContext('2d');
      let painting = false;

      this.canvas2.width = this.canvas2.clientWidth;
      this.canvas2.height = this.canvas2.clientHeight;

      const startPosition = (e: MouseEvent) => {
        painting = true;
        draw(e);
      };

      const endPosition = () => {
        painting = false;
        if (this.ctx2) { // Ensure ctx2 is not undefined
          this.ctx2.beginPath();
        }
        this.canvas2.style.border="none";
      };

      const draw = (e: MouseEvent) => {
        if (!painting) return;

        if (this.ctx2) { // Ensure ctx2 is not undefined
          this.ctx2.lineWidth = this.penSize2;
          this.ctx2.lineCap = 'round';
          this.ctx2.strokeStyle = this.penColor2;

          const rect = this.canvas2.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          this.ctx2.lineTo(x, y);
          this.ctx2.stroke();
          this.ctx2.beginPath();
          this.ctx2.moveTo(x, y);
        }
      };

      this.canvas2.addEventListener('mousedown', startPosition);
      this.canvas2.addEventListener('mouseup', endPosition);
      this.canvas2.addEventListener('mousemove', draw);

      console.log('Sign canvas setup complete');
    } else {
      console.error('Sign canvas element not found', this.canvas2);
    }
  }

  openSignModal(index: number){

    this.isSignModalVisible[index] = true;
    
    setTimeout(() => {
      if (this.writteSignElement) {
        this.setupSignCanvas(index);
        const writteSignElement = this.writteSignElement.nativeElement as HTMLElement;
        writteSignElement.style.display = 'flex';
        console.log("Setup activate or not: ",this.setupSignCanvas)
      } else {
        console.error('writteSignElement is null or undefined',this.writteSignElement);
      }
    }, 0);  
    console.log("it openSign status : ",this.isSignModalVisible)
  }
  refreshSignCanvas(index: number){
    if(this.ctx2){
      this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
    }
  }

saveSignature() {
    if (this.canvas2) {
      const dataURL = this.canvas2.toDataURL();
      // Here you can handle the signature image dataURL as needed
      console.log(dataURL);
      $('#SignModal').modal('hide');
    } else {
      console.error('Canvas element not found');
    }
  }
//////////////////////////////////////////////////////////////////////
  setupCanvas() {
    this.canvas = document.getElementById('writteCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    let painting = false;

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    const startPosition = (e: MouseEvent) => {
      painting = true;
      draw(e);
    };

    const endPosition = () => {
      painting = false;
      this.ctx.beginPath();
    };

    const draw = (e: MouseEvent) => {
      if (!painting) return;

      this.ctx.lineWidth = this.penSize; 
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = this.penColor;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    };

    this.canvas.addEventListener('mousedown', startPosition);
    this.canvas.addEventListener('mouseup', endPosition);
    this.canvas.addEventListener('mousemove', draw);
  }

  changeColor(color: string) {
    this.penColor = color;
  }

  changeSize(size: string) {
    console.log('Pen size before parsing:', size); // Check the size value before parsing
    this.penSize = parseInt(size, 10);
    console.log('Pen size after parsing:', this.penSize); // Check the size value after parsing
  }
  refreshCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

 //End writter section

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
    if (this.isWritteActive) {
      setTimeout(() => this.setupCanvas(), 0);
    }
  }



  //หน้าจอรายละเอียดข้อมูล
  openModal(recordId: any) {

    const modal = $('#myModal');
    const modalBody = modal.find('.modal-body');

    modal.modal({
        backdrop: 'static', // Prevent closing when clicking outside
        keyboard: false     // Prevent closing with keyboard (Esc key)
    });
  
    

    this.sv.getDataById(recordId).subscribe(res=>{
      console.log("getDataById :",res);
      
      this.detailItems =res;
    
      console.log("it on working.. ")

    })
    this.sv.getViewByRecordId(recordId).subscribe((res :any)=>{
      console.log("getDataById :",res);
      
      this.viewData = res;
    
      console.log("it on working.. ")
      
    });
    this.sv.triggerRefresh();
    window.location.reload();
$('#myModal').modal('show');  
   

  }
  // loadViewData() {
  //   this.sv.getItems().subscribe(data => {
  //     this.viewData = data;
  //     this.isLoading = new Array(data.length).fill(false);
  //     this.uploadedImages = new Array(data.length).fill(null);
  //   });
  // }

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

  closeModal() {
    // ซ่อนโมดัล
    $('#insertModel').modal('hide');

    // รีเฟรชหน้าจอ
    this.refreshPage();
  }

  refreshPage() {
    window.location.reload();
  }
  // uploadImage(): void {
  //   const input = document.getElementById('image-upload') as HTMLInputElement;
  //   if (input) {
  //     input.click(); // เปิด dialog เพื่ออัพโหลดรูปภาพ
  //   }
  // }



  // onFileChange(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.uploadedImageUrl = reader.result;
  //       this.isLoading = true;
  //     };
  //     reader.readAsDataURL(file);
  //   }
    
  // }


 addPersonModel(){
  $('#addPersonModel').modal('show');
 }


 addPersonInput(){
  console.log("connet..")
  if(this.PersonINT<4){
  this.PersonINT++;
  this.personInputs.push(this.createPersonGroup());
  // this.personInputs = Array(this.PersonINT).fill(1).map((x, i) => i);
  console.log(this.PersonINT);
}else{
  alert("เพิ่มการกรอกข้อมูลผู้ตรวจได้สูงสุด 4 คน");
}
  // const add = this.addItemForm.get("personal") as FormArray;
  // add.push(this.fb.group({
  //   rank: ['',Validators.required],
  //   fullname: ['',Validators.required],
  // }))
  
 }
 deletePersonInput() {
 ;
 if(this.PersonINT > 1){
 this.PersonINT--;
 this.personInputs.removeAt(this.personInputs.length - 1)
 
 }
 console.log("person delete: ",this.PersonINT)
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


onRecord(recordId: any) {

  $('#writtenModel').modal({
    backdrop: 'static', // Prevent closing when clicking outside
    keyboard: false     // Prevent closing with keyboard (Esc key)
  });

  $('#writtenModel').modal('show'); // ใช้ jQuery เปิด modal
 
}

//insert
  // onInsert(){
  //   $('#insertModel').modal('show'); 
  // }

  onInsertSummit(data) {

    // const newItem = {
    //   record_id: data.id,
    //   record_star_date: data.startDate,
    //   record_end_date: data.endDate,
    //   record_location: data.location,
    //   record_detail: data.detail,
    //   record_topic: data.topic,
    //   fullname: data.personal,
    //   rank: data.personal,
    // };
    // if (!this.items.records) {
    //   this.items.records = [];
    // }
    // this.items.records.unshift(data);
  

    console.log('Item form:',this.addItemForm.value);
    console.log('PernalForm : ',this.addPersonalForm.value);
    console.log('Personal array form : ',this.personal.value)
    console.log("onInsertSubmit..?data : ",data);
    // console.log(this.addPersonalForm.value);
    if (this.addItemForm.invalid || this.personal.invalid ) {
      console.log('ฟอร์มไม่ถูกต้อง');
      // แสดงข้อความแสดงข้อผิดพลาดให้ผู้ใช้ดู
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
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
              title: 'เพิ่มผู้ใช้สำเร็จ!!',
              text: 'ข้อมูลถูกบันทึกในฐานข้อมูลเรียบร้อย',
              icon: 'success',
              confirmButtonText: 'ตกลง'
      });
      $('#insertModel').modal('hide');
      this.addItemForm.reset();
      this.personInputs.clear(); // Clear FormArray
      // this.addPersonInput();

      // Trigger change detection
      this.cdr.detectChanges();
      // this.refreshPage();
    },
    error =>{
      console.error('Error submitting data:', error);
      Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: 'การเพิ่มข้อมูลการตรวจสอบไม่สำเร็จ',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
    }
    
  );
    
  // this.fetchData()


     // Close the modal
     $('#insertModel').modal('hide');
     
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


  printPDF(){
    console.log("working PDF..")
    const elementToPrint = document.getElementById('myDetail');
    html2canvas(elementToPrint,{scale:2}).then((canvas)=>{
      const pdf = new jsPDF('p','mm','a4'); 
      pdf.addImage(canvas.toDataURL('image/png'), 'PDF',0 ,0,210,297);
      pdf.save('การลงตรวจสอบ.pdf')
    });
  }
  
  searchData(data: string) {
    this.sv.searchData(data).subscribe(res => {
      console.log("res searchData:", res);
    });
  }

/////////////////////////////// formatFont Edit
typroHolder:string="พิมที่นี้...";
formatText(command: string) {
  document.execCommand(command, false, null);
  this.updateTyproText();
}

onInput(event: any): void {
  this.typroText = event.target.innerHTML;
}

updateTyproText(): void {
  const editableDiv = document.querySelector('.form-control.full-page-textarea');
  if (editableDiv) {
    this.typroText = (editableDiv as HTMLElement).innerHTML;
  }
}


loadItems(): void {
  this.sv.getItems().subscribe((data) => {
    this.items = data;
  });
}

// onRecord(recordId: any): void {
//   $('#writtenModel').modal('show');
//   this.sv.getNoteById(recordId).subscribe(res=>{
//     console.log("getNoteById :",res);
    
//     this.detailItems = res;
  
//     console.log("it on working.. ")

//     })
//     this.sv.getViewByRecordId(recordId).subscribe((res :any)=>{
//       console.log("getDataById :",res);
      
//       this.viewData = res;
    
//       console.log("it on working.. ")
      
//     });
//   }


openInsertModal(): void {
  const nextId = this.items.records.length + 1;
  const currentDate = moment().format('YYYY-MM-DD');

  this.addItemForm.patchValue({
    id: nextId,
    startDate: currentDate
  });
  
  $('#insertModel').modal({
    backdrop: 'static', // Prevent closing when clicking outside
    keyboard: false     // Prevent closing with keyboard (Esc key)
  });
  $('#insertModel').modal('show');
  
}
// PDFshow() {
//   this.showPDF = true;
// }

// addNewItem(data: any) {
//   this.items.unshift(data);
// }

}
