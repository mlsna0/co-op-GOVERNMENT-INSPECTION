import { Component, OnInit,AfterViewInit  } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../../services/shared.service";
import { GeocodingServiceService } from '../../services/geocodingService/geocoding-service.service'; //พยายามแก้ไข location
import { DataTableDirective ,DataTablesModule} from 'angular-datatables'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import Swal from 'sweetalert2';
import { SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import  html2canvas from 'html2canvas';
import { ElementContainer } from 'html2canvas/dist/types/dom/element-container';
import { Router, ActivatedRoute } from '@angular/router';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { environment } from 'environments/environment';
import { ElementRef,ViewChild,ViewChildren,OnDestroy } from '@angular/core';
import moment from 'moment';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser'; //Typro and show of Detail
import Tesseract from 'tesseract.js'; // Default import Tesseract.js
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { jwtDecode } from 'jwt-decode'; // นำเข้า jwt-decode
import { error } from 'console';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { loginservice } from 'app/layouts/login.services.';
import { ToastrService } from 'ngx-toastr'; // นำเข้า ToastrService
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-table-main',
  templateUrl: './table-main.component.html',
  styleUrls: ['./table-main.component.css']
})
export class TableMainComponent implements OnInit,AfterViewInit  { 
  @ViewChildren('writteSignElement') writteSignElement!: ElementRef;
  @ViewChild('textArea') textArea: ElementRef;
  [x: string]: any;
  pdfs: any[] = []


  startDate: string;
  exportCounter: number = 1;  // ตัวนับเริ่มที่ 1
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
  buttonCount: number = 0;

  
  items:any= [];
  viewData=[];
  Submitted:boolean =false;
  location: string;  
  detailItems: any = {}; 
  PersonINT :number = 0;
  personInputs: FormArray;
  // currentRecordId: string;
  userId: string;
  addItemForm: any;
  addDataForm: any;
  activeButton: string='typro';
  isTyproActive:boolean = true;
  isWritteActive:boolean = false;
  // typroText: string='';
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
  currentUserId: string;
  filteredItems: any[] = [];
  initialFontSize: number = 14;
  htmlContent: string = '';

  private _typroText: string = '';
  private originalFormat: string = '';
  public isReadonly: boolean = true;
  
  get typroText(): string {
    return this._typroText;
  }

  set typroText(value: string) {
    this._typroText = value;
    this.updatePlaceholder();
  }

  placeholder: string = 'พิมพ์ข้อความที่นี่...';

  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private lg:loginservice,
    private router: Router,
    private geocodingService: GeocodingServiceService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private documentService: DocumentService
    

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
      firstname: ['',Validators.required],
      lastname: ['',Validators.required],
    }); //ช้อมูลไม่ได้มาด้วยนะ
    
    this.personInputs = this.addItemForm.get('personal') as FormArray;
    this.addPersonInput(); // Add initial input group
    // this.loadViewData();

  
  
    
    
  }
  
  documentImageUrl = 'assets/img/sampleA4-1.png';

  // onIconSelect() {
  //   let selectedIconCount = /* logic ในการนับไอคอนที่ถูกเลือก */;
  //   this.sv.updateIconCount(selectedIconCount);
  // }
  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get isSuperAdmin(): boolean {
    return this.authService.hasRole('superadmin');
  }

  get isNotSuper(): boolean {
    return this.isAdmin || this.isUser;
  }

  get isUser(): boolean {
    return this.authService.hasRole('user');
  }
 
  ngOnInit(){
    this.loading = true;
    this.items = [];
    this.dtOptions = {
      order: [0],
      pagingType: 'full_numbers',
      language: {
        lengthMenu: "แสดง _MENU_ รายการ",
        search: "ค้นหา",
        info: "แสดงหน้า _PAGE_ จากทั้งหมด _PAGES_ หน้า",
        infoEmpty: "แสดง 0 ของ 0 รายการ",
        // zeroRecords: "ไม่พบข้อมูล",
        paginate: {
          first: "หน้าแรก",
          last: "หน้าสุดท้าย",
          next: "ต่อไป",
          previous: "ย้อนกลับ"
        },
      }
    };
    // console.log("DataTable: ", this.dtOptions);
    this.loadPDFs();
   this.fetchAndSetRecords(); 
    // console.log("ngOnInit called");
}

loadPDFs(): void {
  this.sv.getAllPDFs().subscribe(
    data => {
      // ตรวจสอบโครงสร้างของ data ที่ได้รับ
      console.log('Raw data:', data);
      
      // สมมติว่า data เป็น array ของชื่อไฟล์ PDF
      this.pdfs = data;
      this.pdfCount = this.pdfs.length; // Count the number of PDFs
      console.log('PDFs:', this.pdfs);

      // Update the donut chart after loading PDFs
      this.fetchAndSetRecords();
    },
    error => {
      this.errorMessage = error; // Handle the error
      console.error('Error loading PDFs:', error);
    }
  );
}
fetchAndSetRecords() {
    // console.log("fetchAndSetRecords called");
    this.loading = true;
    
    this.lg.getUserProfile().subscribe({
      next: (userProfile) => {
        // console.log("User Profile fetched:", userProfile);
        this.fetchRecords(userProfile.employeeId.organization); 
         // ส่ง organization ของผู้ใช้เข้าไป
      },
      error: (error) => {
        this.handleError(error)
        // console.log("Error in fetching user profile:", error);
      },
    });
}

fetchRecords(userOrganization: string) {
  // console.log("User Organization:", userOrganization); 
  // console.log("Fetching all records");

  this.sv.getAllRecordsLinkedByEmployeeId().subscribe({
    next: (records) => {
      // console.log("Records fetched:", records);
      const groupedRecords = this.groupRecordsByOrganization(records);
      console.log("Grouped Records by Organization:", groupedRecords);

      const filteredRecords = this.filterByUserOrganization(groupedRecords, userOrganization);
      // console.log("Filtered Records by User Organization:", filteredRecords);
      
      // Combine documents from the filtered records only for the specific organization
      this.items = this.combineDocuments(filteredRecords[userOrganization] || [], userOrganization);
  
      // console.log("Combined Documents:", this.items);
      // this.countUniqueUsers(this.items, userOrganization);
      this.loading = false;
    },
    error: (error) => {
      this.handleError(error);
      // console.log("Error in fetching records:", error);
    },
  });
}

groupRecordsByOrganization(records) {
  // console.log("Grouping records by organization");
  return records.reduce((acc, record) => {
      // console.log("Current Record:", record); // ตรวจสอบข้อมูลในแต่ละ record
      const organization = record.employee.organization || 'Unknown';
      // console.log("Current Record Documents:", record.documents); // ตรวจสอบ documents ภายใน record
      if (!acc[organization]) {
          acc[organization] = [];
      }
      acc[organization].push(record);
      return acc;
  }, {});
}

filterByUserOrganization(groupedRecords, userOrganization: string) {
    // console.log("Filtering grouped records by user organization");
    return {[userOrganization]: groupedRecords[userOrganization] || []};
}

combineDocuments(items, userOrganization: string): any[] {
  const userSet = new Set();
  let combinedDocuments = [];
  let signedDocumentsCount = 0; // ตัวแปรสำหรับนับจำนวนเอกสารที่ถูกเซ็น
  let totalDocumentsCount = 0; // ตัวแปรสำหรับนับจำนวนเอกสารทั้งหมด

  console.log("Processing documents and counting unique users for organization:", userOrganization);

  items.forEach(item => {
    console.log("Current item:", item);

    // กรองเฉพาะ items ที่มี organization ตรงกับ userOrganization
    if (item.employee && typeof item.employee.organization === 'string' && item.employee.organization.includes(userOrganization)) {
      userSet.add(item.user.employeeId);
      // console.log("Matched organization:", item.employee.organization);
      // console.log("Adding documents:", item.documents);
      const documentData = item.documents;

      // รวมเอกสารใน combinedDocuments
      combinedDocuments = combinedDocuments.concat(documentData || []);

      totalDocumentsCount += item.documents.length;
      // // ตรวจสอบว่าเอกสารใน item มี _id ตรงกับชื่อไฟล์ PDF หรือไม่
   
      item.documents.forEach(document => {
        const pdfFileName = `${document._id}.pdf`;
        // console.log("Checking file:", pdfFileName);
  
        if (this.pdfs.includes(`${pdfFileName}.pdf`)) {
          signedDocumentsCount++; // นับเอกสารที่ถูกเซ็น +1
        } else {
          console.log("File not found in PDFs list:", pdfFileName);
        }
      });
    } else {
      console.log("Skipped organization:", item.employee.organization);
    }
  });

  const userCount = userSet.size;
  console.log("User Count:", userCount);
  console.log("Signed Documents Count:", signedDocumentsCount); // แสดงจำนวนเอกสารที่ถูกเซ็น
  console.log("Total Documents Count:", totalDocumentsCount); // แสดงจำนวนเอกสารทั้งหมด
  // ส่งจำนวนผู้ใช้ไปยัง DocumentService
  this.documentService.updateUserCount(userCount);

  // ส่งจำนวนเอกสารที่ถูกเซ็นไปยัง DocumentService หรือจัดการตามที่ต้องการ
  this.documentService.updateSignedDocumentsCount(signedDocumentsCount);
  this.documentService.updateTotalDocumentsCount(totalDocumentsCount);
  // Return the combined documents for use on the web page
  return combinedDocuments;
}

handleError(error) {
  console.error('Error:', error);
  this.loading = false;
}
  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  updateButtonCount() {
    const count = this.items.filter(item => item.record_filename).length;
    this.sv.updateButtonCount(count);
    // console.log('Updated count:', count); // Debugging
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
    // console.log("searchLocation : ",local)
    const [lat, lng] = this.parseLatLng(local);
    window.open(`https://www.google.com/maps?q=(${lat},${lng})` , "_blank");
  }


  
  loadUserRecords(userId: string) {
    this.sv.getRecordWithUserAndEmployee(userId).subscribe(
      data => {
        this.detailItems = data.records;
      },
      error => {
        console.error('Error loading user records:', error);
      }
    );
  }

  //Writter section
  ngAfterViewInit(): void {
    this.setupCanvas();
    // this.setupSignCanvas(index: number);
  }


  openSignModal(index: number){
    this.isSignModalVisible[index] = true;
    
    setTimeout(() => {
      if (this.writteSignElement) {
        this.setupSignCanvas(index);
        const writteSignElement = this.writteSignElement.nativeElement as HTMLElement;
        writteSignElement.style.display = 'flex';
        // console.log("Setup activate or not: ",this.setupSignCanvas)
      } else {
        // console.error('writteSignElement is null or undefined',this.writteSignElement);
      }
    }, 0);  
    // console.log("it openSign status : ",this.isSignModalVisible)
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
      // console.log(dataURL);
      $('#SignModal').modal('hide');
    } else {
      // console.error('Canvas element not found');
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
    // console.log('Pen size before parsing:', size); // Check the size value before parsing
    this.penSize = parseInt(size, 10);
    // console.log('Pen size after parsing:', this.penSize); // Check the size value after parsing
  }
  refreshCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }



 //End writter section////////////////////////////////////////////////////////////////////////////////////


 setActive(button: string){
  this.activeButton = button;
  // console.log("connected..Active");
  if (button === 'typro'){
    this.isTyproActive = true;
    this.isWritteActive = false;
    // console.log("typro section", this.items);
  } else if (button === "writte"){
    this.isTyproActive = false;
    this.isWritteActive = true;
    // console.log("writte section..");
  } else {
    // console.log("selection error");
  }
  if (this.isWritteActive) {
    setTimeout(() => this.setupCanvas(), 0);
  }
}


  openDataDetail(recordId:any){
    // console.log("opendtail: ",recordId)
    this.router.navigate(['/data-detail', recordId]);
  }
  //หน้าจอรายละเอียดข้อมูล
  openDetailModal(recordId: any) {
    this.router.navigate(['/table-detail', recordId]);  
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
  // console.log("onRecord modal getID", this.ContentRecordID);

  // ดึงข้อมูลจาก server
  this.sv.getDataById(recordId).subscribe(res => {
    // console.log("getDataById :", res);
    this.detailItems = res;
    
    // const recordFilenameCount = this.detailItems.record_filename ? this.detailItems.record_filename.length : 0;
    // console.log("Number of record_filename:", recordFilenameCount);

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

countRecordFilenames(recordId: any) {
  this.sv.getDataById(recordId).subscribe(
    res => {
      // console.log("Data received:", res);
      const recordFilenameCount = res.record_filename ? res.record_filename.length : 0;
      // console.log("Number of record_filename:", recordFilenameCount);
    },
    error => {
      // console.error("Error fetching data:", error);
    }
  );
}
recordCommit() {
  // console.log("this.ContentRecordID :", this.ContentRecordID);

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

  // console.log("Record ID being committed:", this.ContentRecordID);

  if (this.isWritteActive) {
    const canvas: HTMLCanvasElement = document.getElementById('writteCanvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (context) {
      const dataURL = canvas.toDataURL();

      Tesseract.recognize(dataURL, 'tha') // ใช้ 'tha' สำหรับภาษาไทย
        .then(({ data: { text } }) => {
          this.typroText = text;
          this.saveRecordContent();
        })
        .catch(error => {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: 'เกิดข้อผิดพลาดในการแปลงภาพเป็นข้อความ.',
            icon: 'error',
            confirmButtonText: 'ตกลง',
            customClass: {
              confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
            }
          });
        });
    }
  } else if (this.isTyproActive) {
    this.saveRecordContent();
  }
}

saveRecordContent() {
  const recordData = {
    content: this.typroText,
    id: this.ContentRecordID
  };

  this.sv.updateRecordContent(recordData).subscribe(
    response => {
      // console.log('บันทึกข้อมูลเรียบร้อย', response);
      Swal.fire({
        title: 'บันทึกข้อมูลสำเสร็จ!!',
        text: 'ข้อมูลถูกบันทึกในฐานข้อมูลเรียบร้อย',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
        }
      }).then((result) => {
        if (result.isConfirmed) {
          document.querySelector('.swal2-confirm').setAttribute('style', 'background-color: #24a0ed; color: white;');
          this.refreshPage();
        }
      });
      $('#writtenModel').modal('hide');
      this.typroText = ''; // ล้างฟิลด์ข้อความ
    },
    error => {
      // console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล.',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
        }
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
  // console.log(this.PersonINT);
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
//  console.log("person delete: ",this.PersonINT)
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
    firstname: ['', Validators.required],
    lastname: ['', Validators.required]
    // fullname: ['', Validators.required]
  });
  
}
//รับค่าหลายตัว
get personal(): FormArray {
  return this.addItemForm.get('personal') as FormArray;
}

 addPersonCommit(value: any) {
  // console.log("commit success", value);
  // ส่งข้อมูลไปยัง controller
  this.sv.postPersonData(value).subscribe(res => {
    // console.log("res postPersonData:", res);
  });
}




//insert
  onInsertModal():void{
  let nextId: number;
  if (this.items && this.items.length >= 0){
    nextId = this.items.length + 1;
    // console.log("items record :",this.items.records)
  } else {
    nextId=0 ;
   
  }
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
    // console.log('Item form:',this.addItemForm.value);
 
    // console.log('Personal array form : ',this.personal.value)
    // console.log("onInsertSubmit..?data : ",data);
    // console.log(this.addPersonalForm.value);
    if (this.addItemForm.invalid || this.personal.invalid ) {
      // console.log('ฟอร์มไม่ถูกต้อง');
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
        this.toastr.error('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'เกิดข้อผิดพลาด!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
        });
      // Swal.fire({
      //   title: 'เกิดข้อผิดพลาด!',
      //   text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
      //   icon: 'error',
      //   timer: 1500,
      //   // confirmButtonText: 'ตกลง',
      //   showConfirmButton: false, 
        // customClass: {
        //   confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
        // }

      // });
      return;
    }
   
    ///การดึงข้อมูลจากผู้สร้างเอกสาร

    // this.sv.postItemData(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
    //   console.log("res postItemData:", res);
    // });
    const token = this.sv.getToken(); // ดึง token จากบริการที่คุณใช้

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.sv.postDataTest(this.addItemForm.value, token).subscribe(res => {
      // console.log("res submitted successfully", res);
      this.toastr.success('เพิ่มข้อมูลสำเร็จ', 'สำเร็จ', {
        timeOut: 2500,  
        positionClass: 'toast-top-right'
      })

      
      // Swal.fire({
      //         title: 'เพิ่มรายการสำเร็จ!!',
      //         text: 'ข้อมูลถูกบันทึกในฐานข้อมูลเรียบร้อย',
      //         icon: 'success',
      //         timer: 1500,
      //         showConfirmButton: false, 
      //         // confirmButtonText: 'ตกลง',
      //         // customClass: {
      //         //   confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
      //         // }

      // }).then((result)=>{
      //   if (result.dismiss === Swal.DismissReason.timer){
      //     this.refreshPage();
      //   }
      // });
      $('#insertModel').modal('hide');
      this.addItemForm.reset();
      this.personInputs.clear(); // Clear FormArray
      // this.addPersonInput();
     
    },
    error =>{
      // console.error('Error submitting data:', error);
      this.toastr.error('การเพิ่มข้อมูลการตรวจสอบไม่สำเร็จ', 'เกิดข้อผิดพลาด!', {
        timeOut: 1500,
        positionClass: 'toast-top-right'
      });
      // Swal.fire({
      //       title: 'เกิดข้อผิดพลาด!',
      //       text: 'การเพิ่มข้อมูลการตรวจสอบไม่สำเร็จ',
      //       icon: 'error',
      //       timer: 1500,
      //       showConfirmButton: false, 
      //       // confirmButtonText: 'ตกลง',
      //       // confirmButtonColor: "#24a0ed",
      //       // customClass: {
      //       //   confirmButton: 'custom-confirm-button' // กำหนด CSS class ที่สร้างขึ้น
      //       // }
      //     }).then((result)=>{
      //       if (result.dismiss === Swal.DismissReason.timer){
      //       }
      //     });

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
        this.originalFormat = `Lat: ${lat}, Lng: ${lng}`;
        this.addItemForm.patchValue({
          location: this.originalFormat
        });
        this.isReadonly = false; // ทำให้ input field สามารถพิมพ์ได้
      }, (error) => {
        // console.error(error)  ;
      });
    } else {
      // console.error('Geolocation is not supported by this browser.');
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    // Regular expression to match the format "Lat: xxxxx, Lng: xxxxx"
    const regex = /^Lat: ([\d\.\-]+), Lng: ([\d\.\-]+)$/;
    const matches = currentValue.match(regex);

    if (matches) {
      const lat = matches[1];
      const lng = matches[2];

      // Validate the lat and lng values if needed

      this.addItemForm.patchValue({
        location: `Lat: ${lat}, Lng: ${lng}`
      });
    } else {
      // Revert to original format if invalid
      this.addItemForm.patchValue({
        location: this.originalFormat
      });
    }
  }
  //insert end here
  


  printPDF = () => {
    // console.log("working PDF..");
    const elementToPrint = document.getElementById('myDetail');
    html2canvas(elementToPrint,{scale:2}).then((canvas)=>{
      const pdf = new jsPDF('p','mm','a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PDF',0 ,0,210,297);
      pdf.save('การลงตรวจสอบ.pdf')
    });
    // this.fetchData()
}

saveRCPDF = () => {
  // console.log("Updating PDF in dictionary...");
  const elementToPrint = document.getElementById('myDetail');

  if (!elementToPrint) {
    // console.error('Element to print not found');
    return;
  }

  html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width ;297

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
          // console.log('PDF saved successfully:', response);

          

          this.refreshPage();
        },
        error => {
          // console.error('Error saving PDF:', error);
        }
      );
    } else {
      // console.error('savePDF function is not defined or not a function');
    }
  }).catch((error) => {
    // console.error('Error generating PDF:', error);
  });
  
  $('#myModal').modal('hide');
    
}

showPDF(id: string) {
  if (!id) {
    // console.error('ID is undefined');
    return;
  } 

  // const pdfPath = `../img/${id}`; // แก้ไขวงเล็บเกิน
  const pdfPath = environment.URL_UPLOAD_IMG + id; // แก้ไขวงเล็บเกิน
  // console.log('pdfPath:', pdfPath);

  this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfPath);
  // console.log('Sanitized PDF Path:', this.pdfSrc);
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
      // console.log("res searchData:", res);
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
    const element = fontElements[i] as HTMLElement;
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
  default:
    return '14px'; // Default size
}
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

  
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    // minHeight: '5rem',
    placeholder: 'พิมพ์ข้อความทที่นี่..',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Sarabun", sans-serif;',
    sanitize:false,
    toolbarHiddenButtons: [
      [
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'textColor',
        'backgroundColor',
        'toggleEditorMode',
        'heading',
        'fontName',
      ],
    ]
   
  };

  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'c') {
      this.copyText();
      event.preventDefault();
    } else if (event.ctrlKey && event.key === 'v') {
      this.pasteText();
      event.preventDefault();
    }
  }

  stripStyles(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  copyText() {
    const plainText = this.stripStyles(this.typroText);
    navigator.clipboard.writeText(plainText).then(() => {
      // console.log('Text copied to clipboard');
    }).catch(err => {
      // console.error('Could not copy text: ', err);
    });
  }

  pasteText() {
    navigator.clipboard.readText().then(text => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      this.typroText = this.typroText + text;
    }).catch(err => {
      // console.error('Could not paste text: ', err);
    });
  }


  updatePlaceholder() {
    this.placeholder = this.typroText ? '' : 'พิมพ์ข้อความที่นี่...';
  }

  exportToExcel(): void {
    const exportData = this.items.records.map((item, index) => ({
      'ครั้งที่': index + 1,                                  // ลำดับครั้งที่
      'หัวข้อการตรวจสอบ': item.record_topic,                 // หัวข้อการตรวจสอบ
      'วันที่เริ่มตรวจสอบ': item.record_star_date,            // วันที่เริ่มตรวจสอบ
      'วันที่เสร็จสิ้น':item.record_end_date,
      'สถานที่': item.record_location,                        // สถานที่
      'สถานะ': item.record_filename ? 'เซ็นสำเร็จ' : 'ยังไม่ได้เซ็น' // สถานะเซ็น
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Report');
  
    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `AuditReport${this.exportCounter}.xlsx`);
  
    this.exportCounter++;
  }
}


