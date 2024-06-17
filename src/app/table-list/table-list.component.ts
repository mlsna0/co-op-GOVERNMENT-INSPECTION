import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../services/shared.service";
import { GeocodingServiceService } from '../services/geocodingService/geocoding-service.service'; //พยายามแก้ไข location
import { DataTableDirective } from 'angular-datatables'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { DataTablesModule } from "angular-datatables"; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Items } from '../../../server/models/itemModel';
import Swal from 'sweetalert2';
import { SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import  html2canvas from 'html2canvas';
import { ElementContainer } from 'html2canvas/dist/types/dom/element-container';
import { Router } from '@angular/router';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { environment } from 'environments/environment';
import { ElementRef,ViewChild,ViewChildren,OnDestroy } from '@angular/core';
import moment from 'moment';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser'; //Typro and show of Detail


@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  [x: string]: any;
  @ViewChildren('writteSignElement') writteSignElement!: ElementRef;
  @ViewChild('textArea') textArea: ElementRef;

  startDate: string;
  people:any[] =[];
  typroHolder:string="พิมที่นี้...";
  //ListUser: users[] =[];
  pdfDataDict: { [key: string]: string } = {};
  Form:FormGroup;
  dtOptions: any ={}; //datatable.setting ={}
  dtTrigger: Subject<any> = new Subject(); 
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;
  public pdfUrl: SafeResourceUrl;

  
  items:any= [];
  viewData=[];
  Submitted:boolean =false;
  location: string;
  detailItems: any = {}; 
  PersonINT :number = 0;
  personInputs: FormArray;
  // currentRecordId: string;
  
  addItemForm: any;
  addDataForm: any;
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
//writter box
  selectedRecordId: any;
  ContentRecordID:any;
  typroTexts: { [key: string]: string } = {}; 
  uploadedImageUrl: string | ArrayBuffer | null = null;
  loading:boolean = false;
  item: any;
  records: any;
  pdfSrc: SafeResourceUrl;
  loadig:boolean = false;
  
  initialFontSize: number = 14;
  


  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private router: Router,
    private geocodingService: GeocodingServiceService,
    private sanitizer: DomSanitizer,

  ) { 
    this.addItemForm = this.fb.group({
      id: ['',Validators.required],
      startDate: ['',Validators.required],
      detail:['',Validators.required],
      endDate: ['',Validators.required],
      location: ['',Validators.required],
      topic: ['',Validators.required],
      content:[''],
      filename: [''],
      // postcode: ['',Validators.required],
      // province: ['',Validators.required],
      // district: ['',Validators.required],
      // subDistrict: ['',Validators.required],
      // address: ['',Validators.required],
      place:['', Validators.required],
      // data_: [''],
      // contentType: [''],
       personal: this.fb.array([]),
      

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

 

 
  ngOnInit(){
    this.loading = true; //เป็นการตรวจ
    this.dtOptions = {
      order:[0],
      //ordering: false,
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
      this.loading = false;

    },(err) => {
      console.log("err : ",err);
      this.loading = false;
    });
    

    
  }
  //parsetLatLang คือการทำงานเกี่ยวกับการแยก lat และ long ให้เป็นสองส่วน แล้วเก็บไปที่ตัวแปร lat ,lng 12/06
  parseLatLng(location: string): [number, number] {
    const latMatch = location.match(/Lat:\s*([0-9.]+)/);
    const lngMatch = location.match(/Lng:\s*([0-9.]+)/);
    const lat = latMatch ? parseFloat(latMatch[1]) : 0;
    const lng = lngMatch ? parseFloat(lngMatch[1]) : 0;
    return [lat, lng];
  }
 
  //
  searchLocation(local:any){
    console.log("searchLocation : ",local)
    const [lat, lng] = this.parseLatLng(local);
    window.open(`https://www.google.com/maps?q=(${lat},${lng})` , "_blank");
  }

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
  ngAfterViewInit(): void {
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
  // refreshSignCanvas(index: number){
  //   if(this.ctx2){
  //     this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
  //   }
  // }

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



 //End writter section////////////////////////////////////////////////////////////////////////////////////


  setActive(button: string){
    this.activeButton = button;
    console.log("connented..Active")
    if (button === 'typro'){
      this.isTyproActive =true;
      this.isWritteActive =false;
     
      console.log("typro section", this.items)
      
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
  openDetailModal(recordId: any) {
    $('#myModal').modal({
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    this.selectedRecordId = recordId;
    
   
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

//////////////////////////////////////////////////////////////////////

onRecord(recordId: any) {
  this.ContentRecordID = recordId;
  console.log("onRecord modal getID", this.ContentRecordID);

  // ดึงข้อมูลจาก server
  this.sv.getDataById(recordId).subscribe(res => {
    console.log("getDataById :", res);
    this.detailItems = res;
    
    // ตั้งค่า typroText ให้เป็น record_content จาก detailItems
    this.typroText = this.detailItems.record_content;
    
    // เปิด modal
    $('#writtenModel').modal({
      backdrop: 'static', // ป้องกันการปิดเมื่อคลิกด้านนอก
      keyboard: false     // ป้องกันการปิดด้วยแป้นพิมพ์ (เช่น ปุ่ม Esc)
    });
    $('#writtenModel').modal('show');
  });
}



  recordCommit() {
    console.log("this.ContentRecordID :",this.ContentRecordID);
    
     //recordId = this.selectedRecordId ;
    if (!this.ContentRecordID) {
      console.error("ID is undefined");
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่มีข้อมูล ID ส่งมา',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
  
    console.log("Record ID being committed:", this.ContentRecordID);
  
    const recordData = {
      content: this.typroText,
      id: this.ContentRecordID
    };
  
    this.sv.updateRecordContent(recordData).subscribe(
      response => {
        console.log('บันทึกข้อมูลเรียบร้อย', response);
        Swal.fire({
          title: 'บันทึกข้อมูลสำเสร็จ!!',
          text: 'ข้อมูลถูกบันทึกในฐานข้อมูลเรียบร้อย',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        }).then((result)=>{
          if (result.isConfirmed){
            this.refreshPage();
          }
        });
        $('#writtenModel').modal('hide');
        this.typroText = ''; // Clear the input field
  
      },
      error => {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล.',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    );
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

 canAddPerson(): boolean {
  const lastPerson = this.personInputs.at(this.personInputs.length - 1) as FormGroup;
  return lastPerson.valid;
}

//  validateAllFormFields(formGroup: FormGroup) {
//     Object.keys(formGroup.controls).forEach(field => {
//       const control = formGroup.get(field);
//       if (control instanceof FormGroup || control instanceof FormArray) {
//         this.validateAllFormFields(control);
//       } else {
//         control.markAsTouched({ onlySelf: true });
//       }
//     });
//   }

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




//insert
  onInsertModal():void{

  const nextId = this.items.records.length + 1;
  const currentDate = moment().format('YYYY-MM-DD');

  this.addItemForm.patchValue({
    id: nextId,
    startDate: currentDate,
    endDate: currentDate
  });

    $('#insertModel').modal({
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    $('#insertModel').modal('show');
    
  }




  onInsertSummit(data) {
    this.Submitted = true; 
    // console.log(data);
    console.log('Item form:',this.addItemForm.value);
    console.log('PernalForm : ',this.addPersonalForm.value);
    console.log('Personal array form : ',this.personal.value)
    console.log("onInsertSubmit..?data : ",data);
    // console.log(this.addPersonalForm.value);
    if (this.addItemForm.invalid || this.personal.invalid ) {
      console.log('ฟอร์มไม่ถูกต้อง');
      // แสดงข้อความแสดงข้อผิดพลาดให้ผู้ใช้ดู
      let invalidFields = [];
        Object.keys(this.addItemForm.controls).forEach(key => {
            if (this.addItemForm.controls[key].invalid) {
                invalidFields.push(this.getFieldLabel(key));
            }
        });

        (this.personal as FormArray).controls.forEach((person: AbstractControl, index: number) => {
          let personGroup = person as FormGroup;
          Object.keys(personGroup.controls).forEach(key => {
              if (personGroup.controls[key].invalid) {
                  invalidFields.push(`Personal field ${index + 1} - ${this.getFieldLabel(key)}`);
              }
          });
        });
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
      }).then((result)=>{
        if (result.isConfirmed){
          this.refreshPage();
        }
      });
      $('#insertModel').modal('hide');
      this.addItemForm.reset();
      this.personInputs.clear(); // Clear FormArray
      // this.addPersonInput();
     
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
  
  getFieldLabel(fieldName: string): string {
    const fieldLabels = {
        id: 'ครั้งที่',
        startDate: 'วันที่เริ่มตรวจสอบ',
        endDate: 'วันที่เสร็จสิ้น',
        topic: 'หัวข้อการตรวจสอบ',
        personal: 'บุคคล',
        rank: 'ยศ/ตำแหน่ง',
        fullname: 'ชื่อ-นามสกุล',
        detail: 'รายละเอียด',
        location: 'สถานที่'
    };
    return fieldLabels[fieldName] || fieldName;
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
  


  printPDF = () => {
    console.log("working PDF..");
    const elementToPrint = document.getElementById('myDetail');
    html2canvas(elementToPrint,{scale:2}).then((canvas)=>{
      const pdf = new jsPDF('p','mm','a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PDF',0 ,0,210,297);
      pdf.save('การลงตรวจสอบ.pdf')
    });
    // this.fetchData()
}

saveRCPDF = () => {
  console.log("Updating PDF in dictionary...");
  const elementToPrint = document.getElementById('myDetail');

  if (!elementToPrint) {
    console.error('Element to print not found');
    return;
  }

  html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297 ;//(canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Convert the PDF to Blob
    const pdfBlob = pdf.output('blob');

    // Create FormData to send the PDF to backend
    const formData = new FormData();
    const pdfFilename = 'การลงตรวจสอบ.pdf'; // Change to the desired filename
    formData.append('id', this.selectedRecordId); // Adjust the ID as needed
    formData.append('pdf', pdfBlob, pdfFilename);

    // Check if `this.sv.savePDF` exists and is a function
    if (typeof this.sv !== 'undefined' && typeof this.sv.savePDF === 'function') {
      // Send the PDF to the backend
      this.sv.savePDF(formData).subscribe(
        response => {
          console.log('PDF saved successfully:', response);
        },
        error => {
          console.error('Error saving PDF:', error);
        }
      );
    } else {
      console.error('savePDF function is not defined or not a function');
    }
  }).catch((error) => {
    console.error('Error generating PDF:', error);
  });
  
  $('#myModal').modal('hide');
}

showPDF(id: string) {
  if (!id) {
    console.error('ID is undefined');
    return;
  } 

  // const pdfPath = `../img/${id}`; // แก้ไขวงเล็บเกิน
  const pdfPath = environment.URL_UPLOAD_IMG + id; // แก้ไขวงเล็บเกิน
  console.log('pdfPath:', pdfPath);

  this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
  console.log('Sanitized PDF Path:', this.pdfSrc);
  window.open(pdfPath,'_blank')


  // $('#showpdf').modal('show');
}


//     while (position < imgHeight) {
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

//       position += A4_HEIGHT; // เลื่อนตำแหน่งลงหน้าถัดไป

//       if (position < imgHeight) {
//         pdf.addPage(); // เพิ่มหน้าใหม่เมื่อยังไม่สามารถแสดงหมดได้ในหน้าเดียว
//       }
//     }

//     pdf.save('การลงตรวจสอบ.pdf');
//   });
// }

  searchData(data: string) {
    this.sv.searchData(data).subscribe(res => {
      console.log("res searchData:", res);
    });
  }

/////////////////////////////// formatFont Edit

formatText(command: string): void {
  document.execCommand(command, false, '');
  this.updateTyproText();
}

onInput(event: Event): void {
  const target = event.target as HTMLElement;
  this.typroText = target.innerHTML;
}

updateFontSize(): void {
  const fontElements = document.getElementsByTagName('font');
  for (let i = 0; i < fontElements.length; i++) {
    const element = fontElements[i] as HTMLElement; // Cast to HTMLElement
    const size = element.getAttribute('size');
    if (size) {
      switch (size) {
        case '1':
          element.style.fontSize = '8px';
          break;
        case '2':
          element.style.fontSize = '10px';
          break;
        case '3':
          element.style.fontSize = '12px';
          break;
        case '4':
          element.style.fontSize = '14px';
          break;
        case '5':
          element.style.fontSize = '18px';
          break;
        case '6':
          element.style.fontSize = '24px';
          break;
        case '7':
          element.style.fontSize = '36px';
          break;
      }
      element.removeAttribute('size');
    }
  }
  this.updateTyproText();
}

updateTyproText(): void {
const editableDiv = document.querySelector('.form-control.full-page-textarea');
if (editableDiv) {
  this.typroText = (editableDiv as HTMLElement).innerHTML;
}
}
changeFontSize(event: Event): void {
const target = event.target as HTMLSelectElement;
const fontSize = target.value;
const selection = window.getSelection();
if (!selection.rangeCount) return;

const range = selection.getRangeAt(0);
const span = document.createElement('span');
span.style.fontSize = this.mapFontSize(fontSize);
range.surroundContents(span);
this.updateTyproText();
}

mapFontSize(size: string): string {
switch (size) {
  case '1':
    return '8px';
  case '2':
    return '10px';
  case '3':
    return '12px';
  case '4':
    return '14px';
  case '5':
    return '18px';
  case '6':
    return '24px';
  case '7':
    return '36px';
  default:
    return '14px'; // Default size
}
}

getSafeHtml(content: string): SafeHtml {
return this.sanitizer.bypassSecurityTrustHtml(content);
}

editContent() {
  this.typroText = this.detailItems.record_content;
  this.isTyproActive = true; // เปิดการแก้ไข
  }
loadContent() {
    // การดึงข้อมูลจากฐานข้อมูลมาแสดง (ตัวอย่าง)
    this.detailItems = {
      record_content: ' '
    };
  }

 
}





 ///////////////////เเบ่งหน้า///////////////////////////////////
 


