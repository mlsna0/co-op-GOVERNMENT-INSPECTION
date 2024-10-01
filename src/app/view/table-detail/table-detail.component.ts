import { Component, OnInit, ChangeDetectorRef, ViewChildren, ElementRef, HostListener, Renderer2, ViewChild, QueryList } from '@angular/core';
import { FormGroup, FormsModule, FormControl, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { SharedService } from "../../services/shared.service";
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { RecordModel } from '../../../../server/models/recordModel';
import { SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ElementContainer } from 'html2canvas/dist/types/dom/element-container';
import { Router } from '@angular/router';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { environment } from 'environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; //Typro and show of Detail
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/layouts/auth-layout/auth-layout.Service';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import * as QRCode from 'qrcode';

import { ToastrService } from 'ngx-toastr';
import { config } from 'dotenv';

// import { PdfViewerModule } from 'ng2-pdf-viewer';




@Component({
  selector: 'app-table-detail',
  templateUrl: './table-detail.component.html',
  styleUrls: ['./table-detail.component.css']
})
export class TableDetailComponent implements OnInit {
  @ViewChildren('writteSignElement') writteSignElements: QueryList<ElementRef>;
  @ViewChild('firstPage', { static: false }) firstPage: ElementRef; //break page
  @ViewChild('mainCenterPanel') mainCenterPanel: ElementRef;//for over sign-content


  currentUser: any;
  RoleCurrenUser: any;



  details: any[] = []; //break page

  textContentLength: number = 0;
  remainingContentLength: number = 0;
  contentParts: SafeHtml[] = [];
  saveCount = 0;
  recordId: any;
  viewData: any[] = [];
  remainingContent: string = '';//content ที่ตัดออกจะเก็บที่นี้?
  otherRemainingContent: string = '';//content ที่ตัดออกจะเก็บที่นี้? ระดับ 3
  isContentOverflow = false; //
  private isNoContentLogged: boolean = false;
  addItemForm: any;
  boxes: any[] = [];


  addRecordForm: FormGroup;
  addPersonalForm: FormGroup;
  detailItems: any = {};
  displayedContent: string = '';
  truncatedContent: string = '';
  maxLength: number = 250;

  //upload file PDF
  uploadedPDF: SafeResourceUrl | undefined;
  selectedFile: any = "";
  selectedFilePath: String = "";
  selectedFileB64: string = "";
  isFileImage = false;
  isFileDocument = false;

  isSignModalVisible: boolean[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  penColor2: string = 'black';
  penSize2: number = 1;

  //move element
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  testFile: any;
  canvasList: any[] = [];
  ctxList: CanvasRenderingContext2D[] = [];

  qrCodeUrl: string | null = null;

  //select box sign to save signature Picture
  selectedIndex: number | null = null;
  selectedPersonId: string | null = null;
  personIdFromURL: any
  url: string;
  personId: string | null;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sv: SharedService,
    private router: Router,
    private ACrouter: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private pdfService: NgxExtendedPdfViewerService,
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
    private toastr: ToastrService,
  ) { }

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

  ngOnInit(): void {


    this.ACrouter.paramMap.subscribe(params => {
      this.recordId = params.get('id');

      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log("recordID it send? >", this.recordId); // ทดสอบการดึงค่า id
    });

    this.sv.getDataById(this.recordId).subscribe(res => {
      console.log("getDataById :", res);

      this.detailItems = res;


      console.log("it on working.. ")
      if (this.detailItems && this.detailItems.record_content) {
        // this.truncateAndStoreContent(this.detailItems.record_content, 250);
      }
      console.log("Displayed content:", this.displayedContent);
      console.log("Truncated content:", this.truncatedContent);

    });


    this.sv.getViewByRecordId(this.recordId).subscribe((res: any) => {
      console.log("getDataById :", res);

      this.viewData = res;

      console.log("it on working.. ")


      this.isSignModalVisible = new Array(this.viewData.length).fill(false);

      setTimeout(() => {
        this.cdr.detectChanges(); // ทำการตรวจสอบการเปลี่ยนแปลง
      }, 0);
    });

    this.getCurrentUser();//เพื่อปิด ไม่สามารถไปทีหน้าหลัก dashboard ได้

  }

  ngAfterViewInit() {

    // Subscribe และดึงข้อมูลจาก API หรือแหล่งอื่น ๆ
    this.sv.getViewByRecordId(this.recordId).subscribe((res: any) => {
      console.log("getViewByRecordId response:", res);

      this.viewData = res; // กำหนดค่า viewData จากข้อมูลที่ได้รับ

      // รอให้ Angular สร้าง elements และ QueryList ให้เรียบร้อย
      setTimeout(() => {
        // กำหนดความยาวของ writteSignElements เท่ากับความยาวของ viewData

        this.writteSignElements = new QueryList<ElementRef>(...this.viewData.map(() => null));

        // อัพเดท UI หลังจากที่กำหนดค่า
        this.cdr.detectChanges();

        // ต่อไปคุณสามารถดำเนินการเพิ่มอย่างอื่นต่อได้ที่นี่
      });
    });

    //this.checkContentOverflow();

    this.checkContentOverflow();
    window.addEventListener('resize', this.checkContentOverflow.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkContentOverflow.bind(this));
  }
  ngAfterViewChecked() {
    this.cdr.detectChanges();
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
      // console.log("this RoleCurrenUser : ", this.RoleCurrenUser);
    } else {
      console.log('No user data found in localStorage.');
    }
  }

  //////////////////////////////////////////////////////////////////////
  setupSignCanvas(index: number) {
    console.log("index sign: ", index);

    let canvasitem = document.getElementById(`writteSignCanvas-${index}`) as HTMLCanvasElement;
    this.canvasList.push(canvasitem)

    if (canvasitem) {
      let canvasFind = this.canvasList.find(x => x.id == `writteSignCanvas-${index}`)
      this.ctxList.push(canvasFind.getContext('2d'))
      let ctxFind = this.ctxList.find(x => x.canvas?.id == `writteSignCanvas-${index}`)

      let painting = false;
      canvasFind.width = canvasitem.clientWidth;
      canvasFind.height = canvasitem.clientHeight;

      const startPosition = (e: MouseEvent) => {
        painting = true;
        draw(e);
        // console.log('Mouse down at: ', e.clientX, e.clientY);
      };

      const endPosition = () => {
        painting = false;
        if (ctxFind) { // Ensure ctx is not undefined
          ctxFind.beginPath();
        }
        // console.log('Mouse up');
        canvasFind.style.border = "none";
      };

      const draw = (e: MouseEvent) => {
        if (!painting) return;

        if (ctxFind) { // Ensure ctx is not undefined
          ctxFind.lineWidth = this.penSize2;
          ctxFind.lineCap = 'round';
          ctxFind.strokeStyle = this.penColor2;

          const rect = canvasFind.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          ctxFind.lineTo(x, y);
          ctxFind.stroke();
          ctxFind.beginPath();
          ctxFind.moveTo(x, y);

          // console.log("Drawing at: ",x,y);
        }
      };

      canvasFind.addEventListener('mousedown', startPosition);
      canvasFind.addEventListener('mouseup', endPosition);
      canvasFind.addEventListener('mousemove', draw);

      console.log('Sign canvas setup complete');
    } else {
      console.error('Sign canvas element not found', canvasitem);
    }
  }

  refreshCanvas(index) {
    let canvasFind = this.canvasList.find(x => x.id == `writteSignCanvas-${index}`)
    let ctxFind = this.ctxList.find(x => x.canvas?.id == `writteSignCanvas-${index}`)
    if (ctxFind) {
      ctxFind.clearRect(0, 0, canvasFind.width, canvasFind.height);
    }
  }


  // openSignModalx(i) {
  //   console.log("openSignModalx  x " + i);

  // }

  openSignModal(index: number, personId: any) {
    console.log("Sign modal is work index: >", index);
    console.log("person Id signBox: ", personId)

    this.selectedIndex = index;
    this.selectedPersonId = personId;
    this.isSignModalVisible[index] = true;


    console.log("it openSign status: ", this.isSignModalVisible);
    this.cdr.detectChanges();

    setTimeout(() => {

      let signboxEL = this.el.nativeElement as HTMLElement;
      let signboxItem = signboxEL.querySelector<HTMLElement>(`#SignModal-${index}`)
      console.log("signboxItem : ", signboxItem);


      if (signboxItem) {
        this.cdr.detectChanges();
        // writteSignElement.style.display = 'flex';
        this.setupSignCanvas(index);
        console.log("Setup activated for canvas index: ", index);
      } else {
        console.error('writteSignElement is null or undefined', signboxItem);//this.writteSignElements.toArray()[index]
      }
    }, 0);


  }

  // ฟังก์ชันบันทึกลายเซ็น
  saveSignature(index: number, personId: string) {

    // ตรวจสอบว่ามี personId หรือไม่ ถ้าไม่มีให้ข้ามไปเลย
    if (!personId) {
      console.log("PersonId เป็น null หรือไม่มีค่า ไม่บันทึกลายเซ็น");
      return;
    }
    console.log(" saveSignature index: ", index);
    console.log("saveSignature person Id:", personId);
    const canvasElement = document.getElementById(`writteSignCanvas-${index}`) as HTMLCanvasElement;


    console.log(" saveSignature canvasElement:", canvasElement);
    console.log("saveSignature record Id:", this.recordId);
    // ตรวจสอบว่ามีลายเซ็นหรือไม่
    let signatureData = '';

    if (canvasElement) {
      // ตรวจสอบว่ามีการวาดลายเซ็นใน canvas หรือไม่
      signatureData = canvasElement.toDataURL('image/png'); // แปลงลายเซ็นเป็น base64
      console.log(" saveSignature signatureData:", signatureData)
    }

    // ตรวจสอบว่ามีลายเซ็นใน canvas หรือไม่
    if (!signatureData || !signatureData.startsWith('data:image/png;base64,')) {
      if (!personId) {
        console.error("ข้อมูลลายเซ็นไม่ถูกต้อง");
        return;
      }
    }

    // ส่งข้อมูลไปยัง backend พร้อมกับ personId และลายเซ็น
    this.sv.saveSignature(this.recordId, personId, signatureData).subscribe(response => {
      if (response.success) {


        // สร้างไฟล์ลายเซ็นหลังจากบันทึกสำเร็จ
        const link = document.createElement('a');
        link.href = signatureData; // ข้อมูล base64
        link.download = `signature_${personId}.png`; // ชื่อไฟล์ที่ต้องการดาวน์โหลด

        // // คลิกลิงก์เพื่อดาวน์โหลดไฟล์
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link); // ลบลิงก์หลังจากดาวน์โหลด
        // Show success notification
        this.toastr.success('บันทึกลายเซ็นสำเร็จ', 'สำเร็จ!!', {
          timeOut: 1500,
          positionClass: 'toast-top-right',
        });
      } else {
        console.error("เกิดข้อผิดพลาดในการบันทึกลายเซ็น");
      }
    });
  }

  getSignatureUrl(signatureFileName: string): string {
    const baseUrl = 'http://localhost:3000/api/'; // URL ของเซิร์ฟเวอร์ Express ที่รันอยู่
    const fullUrl = `${baseUrl}signaturesDetail/${signatureFileName}`;
    // console.log(" getSignatureUrl ",signatureFileName)
    // this.getPersonIdFromSignatureFile(signatureFileName)

    return fullUrl;

  }
  // ฟังก์ชันเพื่อดึง _id จากชื่อไฟล์ลายเซ็นต์
  getPersonIdFromSignatureFile(signatureFileName: string): string | null {
    // แยกชื่อไฟล์โดยใช้ _ เป็นตัวแบ่ง
    const parts = signatureFileName.split('_');

    // ตรวจสอบว่ามีค่าพอที่จะดึง _id ได้ (เช่น ต้องมีส่วนกลางเป็น _id)
    if (parts.length >= 3) {
      // _id จะอยู่ในตำแหน่งที่ 1 ของ array
      this.personIdFromURL = parts[1];
      // console.log("Extracted personId:", this.personIdFromURL);
      return this.personIdFromURL;
    }

    // ถ้าไม่สามารถดึง _id ได้ return null
    console.error("Unable to extract this.personIdFromURL from filename:", signatureFileName);
    return null;
  }


  addBox() {
    this.boxes.push({ top: '0px', left: '0px' });
    this.isSignModalVisible.push(false);
  }
  onDragStart(event: DragEvent, index: number): void {
    if (index === undefined) {
      console.error('Index is undefined in onDragStart');
      return;
    }
    const box = this.boxes[index];
    if (!box) {
      console.error('Box not found at index start:', index);
      return;
    }
    console.log('Box before drag:', box);
    box.dragStartX = event.clientX - box.left;
    box.dragStartY = event.clientY - box.top;

    // ซ่อนปุ่มเมื่อเริ่มลาก
    // const closeBtn = document.getElementById(`close-btn-${index}`);
    // const dragBtn = document.getElementById(`drag-btn-${index}`);
    // if (closeBtn) closeBtn.style.display = 'none';
    // if (dragBtn) dragBtn.style.display = 'none';
  }

  onDragEnd(event: DragEvent, index: number): void {
    if (index === undefined) {
      console.error('Index is undefined in onDragEnd');
      return;
    }
    const box = this.boxes[index];
    if (!box) {
      console.error('Box not found at index end:', index);
      return;
    }
    box.left = event.clientX - box.dragStartX;
    box.top = event.clientY - box.dragStartY;
    delete box.dragStartX;
    delete box.dragStartY;
    console.log('Box after drag:', box);

    // ซ่อนปุ่มหลังจากการลากเสร็จสิ้น
    // const closeBtn = document.getElementById(`close-btn-${index}`);
    // const dragBtn = document.getElementById(`drag-btn-${index}`);
    // if (closeBtn) closeBtn.style.display = 'none';
    // if (dragBtn) dragBtn.style.display = 'none';
  }

  blobToBase64(blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }
  closeSignModal(index: number): void {
    this.isSignModalVisible[index] = false;
  }

  //open file pdf to preview or edit to sign
  async onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    const btnAddBox = document.getElementById('btn-add-box');

    if (this.selectedFile) {
      this.testFile = await this.blobToBase64(event.target.files[0])
      console.log("test file : ", this.testFile);

      var reader = new FileReader();
      console.log("event.target.files[0] : ", event.target.files[0]);
      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (event) => {
        let path = event.target == null ? '' : event.target.result;
        this.selectedFilePath = path as string;
        this.selectedFileB64 = this.selectedFilePath.split(",")[1];
        this.testFile = reader.result;

        if (this.selectedFilePath.includes('image')) {
          this.isFileImage = true;
          this.isFileDocument = false;
        } else {
          this.isFileImage = false;
          this.isFileDocument = true;
        }

        console.log("this is files img: ", this.isFileImage);
        console.log("this is files Doc: ", this.isFileDocument);

        // แสดงปุ่มเมื่อมีไฟล์ถูกเลือก
        if (btnAddBox) {
          btnAddBox.style.display = 'block';
        }
      }
    } else {
      // ซ่อนปุ่มเมื่อไม่มีไฟล์ถูกเลือก
      if (btnAddBox) {
        btnAddBox.style.display = 'none';
      }
    }
  }

  clearFileInput(): void {
    this.selectedFile = null;
    this.selectedFilePath = '';
    this.selectedFileB64 = '';
    this.isFileImage = false;
    this.isFileDocument = false;
    this.testFile = undefined;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const btnAddBox = document.getElementById('btn-add-box'); // เพิ่มส่วนนี้

    if (fileInput) {
      fileInput.value = '';
    }

    if (btnAddBox) { // เพิ่มส่วนนี้
      btnAddBox.style.display = 'none';
    }
  }



  //ิback to table-list
  BackRoot() {
    this.router.navigate(['/table-main']);
  }
  onSignPage() {
    const documentId = this.detailItems?._id;  // ใช้ _id จาก MongoDB
    this.router.navigate(['/signature'], { queryParams: { id: documentId } });  // ส่ง id ไปยังหน้าการลงลายเซ็น
  }
  //add page??
  addDetail() {
    console.log("addDetail work")
    this.details.push({});
  }
  //page break

  //การเลยขนนาดของ หน้าจอ 
  checkContentOverflow() {
    const mainDetailElement = document.getElementById('myDetail');
    // console.log("mainDetailElement :", mainDetailElement);

    const mainCenterPanelElement = this.mainCenterPanel?.nativeElement;

    if (mainDetailElement && mainCenterPanelElement) {
      const contentHeight = mainCenterPanelElement.scrollHeight;
      const containerHeight = mainDetailElement.clientHeight;
      // console.log('contentHeight:', contentHeight);
      // console.log('containerHeight:', containerHeight);
      this.isContentOverflow = contentHeight > containerHeight;
      // console.log('isContentOverflow:', this.isContentOverflow);
    }
  }
  //ตัวช่วยการลด re-render ของ tag div etc.
  trackByFn(index: number, item: any): number {
    return index; // หรือใช้ unique identifier ของ item
  }


  //show content table
  getSafeHtml(content: string): SafeHtml {
    if (!content) {
      if (!this.isNoContentLogged) {
        console.log("no content ", content);
        this.isNoContentLogged = true; // ตั้งค่าเป็น true เมื่อแสดงข้อความแล้ว
      }
      return "";
    }
    const maxLength = 1520;
    const AddLength = 900;
    const textcontent = content?.substring(0, maxLength);

    this.remainingContent = content?.substring(maxLength);

    // this.otherRemainingContent = this.remainingContent.substring(3050)
    // this.textContentLength = textcontent.length; 
    // this.remainingContentLength = this.remainingContent.length;

    this.contentParts = this.splitContent(this.remainingContent, maxLength + AddLength);
    // console.log("textContent : ",textcontent);
    //  console.log("contentParts :",this.contentParts);
    // console.log("textContent :",textcontent)
    // console.log("textContent Count :",this.textContentLength)
    // console.log("textREMAINContent Count :",this.remainingContentLength)
    return this.sanitizer.bypassSecurityTrustHtml(textcontent);
  }

  splitContent(content: string, chunkSize: number): SafeHtml[] {
    const parts: SafeHtml[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize);
      parts.push(this.sanitizer.bypassSecurityTrustHtml(chunk));
    }
    return parts;
  }



  printPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const elements = document.querySelectorAll('.modal-body-detail'); // เลือกทุกองค์ประกอบที่ต้องการ
    let promises = [];

    if (elements.length === 0) {
      console.error('No elements found to print.');
      return;
    }

    // ซ่อนปุ่ม refresh ทั้งหมด
    const refreshButtons = document.querySelectorAll('.btn-refreshCanvas') as NodeListOf<HTMLElement>;
    refreshButtons.forEach(button => {
      button.style.display = 'none';
    });
    // ลบเนื้อหาใน modal ทั้งหมด
    const openSignModals = document.querySelectorAll('.openSignModal') as NodeListOf<HTMLElement>;
    openSignModals.forEach(modal => {
      modal.innerHTML = ""; // ลบเนื้อหาภายใน
      modal.style.border = 'none'; // ลบเส้นขอบ
      modal.style.background = 'transparent'; // ลบพื้นหลัง
    });
    elements.forEach((element, index) => {
        // ซ่อนปุ่ม refresh ทั้งหมด
      const style = getComputedStyle(element as HTMLElement);
      if (style.display === 'none') {
        return; // ข้าม element ที่ไม่แสดง
      }
      promises.push(
        html2canvas(element as HTMLElement, {
          scale: 2,
          useCORS: true
        }).then(canvas => {
          const imgWidth = 210; // A4 width in mm
          const imgHeight = canvas.height * imgWidth / canvas.width;
          const contentDataURL = canvas.toDataURL('image/png');
          if (index > 0) { // เพิ่มหน้าใหม่ใน PDF ถ้าไม่ใช่หน้าแรก
            pdf.addPage();
          }
          pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
        }).catch(error => {
          console.error('Error creating canvas for element:', element, error);
        })
      );
    });

    Promise.all(promises).then(() => {
      pdf.save('เอกสารการลงตรวจ.pdf');
    }).catch(error => {
      console.error('Error generating PDF:', error);
    });
  }


  saveRCPDF() {
    console.log("Updating PDF in dictionary...");
    const elements = document.querySelectorAll('.modal-body-detail');
    // const pdfViewerElement = document.getElementById('pdf-viewer');

    // if (!pdfViewerElement && elements.length === 0) {
    //   console.error('No elements found to print.');
    //   return;
    // }

    ///////////////////////////////////////////////////// // ตรวจสอบว่ามีการเซ็นในกล่องใดบ้าง

    let allSigned = true;  // เริ่มต้นสมมุติว่าเซ็นครบ
    let anySigned = false; // เริ่มต้นสมมุติว่าไม่มีการเซ็น

    this.viewData.forEach((person, index) => {

      const canvasElement = document.getElementById(`writteSignCanvas-${index}`) as HTMLCanvasElement;

      // แสดงข้อมูลคนและลายเซ็น
      // console.log("personId จาก for Each: ", person);
      // console.log("person.signature จาก for Each: ", person.signature);

      // ตรวจสอบว่าคนนี้มีลายเซ็นหรือไม่
      if (person.signature) {
        anySigned = true;  // ถ้ามีลายเซ็น ให้ตั้งค่าเป็น signed
      } else if (canvasElement) {
        // ถ้า canvasElement มีอยู่ ให้ตรวจสอบบริบท
        console.log(" if canvasElement", canvasElement);
        const ctx = canvasElement.getContext('2d');

        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);

          if (imageData) {
            // ตรวจสอบว่ามีพิกเซลที่ไม่เป็นศูนย์ใน imageData หรือไม่
            const hasSignature = imageData.data.some(channel => channel !== 0);

            if (hasSignature) {
              anySigned = true;  // ตั้งค่าเป็น signed ถ้ามีพิกเซลที่วาด
            } else {
              allSigned = false;  // ตั้งค่าเป็น false ถ้าไม่มีลายเซ็นวาด
            }
          }
        }
      } else {
        // ถ้า canvasElement เป็น null หมายความว่ากล่องนี้ยังไม่ได้เซ็น
        allSigned = false;  // ยังคงมีบางกล่องที่ยังไม่ได้เซ็น
      }


    });

    this.saveSignature(this.selectedIndex, this.selectedPersonId) //ส่งข้อมูลไปบันทึกลายเซ็น
    // ส่งสถานะ: ถ้าเซ็นครบ ส่งสถานะ 1, ถ้าไม่ครบ ส่งสถานะ 2
    const statusToSend = allSigned ? 1 : 2;
    // console.log("All signed:", allSigned, "Any signed:", anySigned, "Status to send:", statusToSend);

    // หากไม่มีการเซ็นในกล่องใดๆ
    if (!anySigned) {
      console.error('No signatures found in any box. Cannot save PDF.');
      this.toastr.error('ไม่สามารถบันทึกได้ กรุณาลงนาม', 'ผิดพลาด!', {
        timeOut: 1500,
        positionClass: 'toast-top-right',
      });
      return; // ออกจากฟังก์ชัน
    }


    ////////////////////////////////////////////////////

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    let promises = [];
    // const promises: Promise<string>[] = []; 

    // ซ่อนปุ่ม refresh ทั้งหมด
    const refreshButtons = document.querySelectorAll('.btn-refreshCanvas') as NodeListOf<HTMLElement>;
    refreshButtons.forEach(button => {
      button.style.display = 'none';
    });
    // ลบเนื้อหาใน modal ทั้งหมด
    const openSignModals = document.querySelectorAll('.openSignModal') as NodeListOf<HTMLElement>;
    openSignModals.forEach(modal => {
      modal.innerHTML = ""; // ลบเนื้อหาภายใน
      modal.style.border = 'none'; // ลบเส้นขอบ
      modal.style.background = 'transparent'; // ลบพื้นหลัง
    });
     // ลบเนื้อหาใน modal ทั้งหมด
     const writteSignElement = document.querySelectorAll('.full-page-signWritte') as NodeListOf<HTMLElement>;
     writteSignElement.forEach(modal => {
       modal.style.border = 'none'; // ลบเส้นขอบ
       modal.style.background = 'transparent'; // ลบพื้นหลัง
     });
    console.log("elements: ",elements)
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement; // แคสต์ Element เป็น HTMLElement
      htmlElement.style.border = 'none';
      htmlElement.style.borderCollapse = 'collapse';
      console.log("viewData in elements: ",this.viewData)
      promises.push(
        html2canvas(htmlElement, {
          scale: 5,
          useCORS: true
        }).then(canvas => {
          const imgWidth = 210; // A4 width in mm
          const imgHeight = canvas.height * imgWidth / canvas.width;
          const contentDataURL = canvas.toDataURL('image/png');
          if (index > 0) { // เพิ่มหน้าใหม่ใน PDF ถ้าไม่ใช่หน้าแรก
            pdf.addPage();
          }
          pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
        }).catch(error => {
          console.error('Error creating canvas for element:', element, error);
        })
      );
      // ตรวจสอบว่ามีข้อมูลใน viewData และมีขนาดที่ถูกต้อง
      if (this.viewData && index < this.viewData.length) {

        let person = this.viewData;
       

        // promises.push(html2canvas(htmlElement, { scale: 5 }).then((canvas) => {
        //   const imgData = canvas.toDataURL('image/png');
        //   const canvasWidth = canvas.width;
        //   const canvasHeight = canvas.height;
        //   const ratio = canvasWidth / pdfWidth; // กำหนด ratio ที่นี่
        //   const pdfCanvasHeight = canvasHeight / ratio; // คำนวณ pdfCanvasHeight ที่นี่
        //   const numOfPages = Math.ceil(pdfCanvasHeight / pdfHeight);
        //   console.log("num of page: ",numOfPages)
        //   console.log("canvasHeight: ",canvasHeight)
      
        //   for (let i = 0; i < numOfPages; i++) {
        //     const startY = i * pdfHeight * ratio;
        //     const remainingHeight = canvasHeight - startY;
        //     let tempCanvasHeight = Math.min(remainingHeight, pdfHeight * ratio);
        
        //     // ปรับให้ tempCanvasHeight เป็น 1 หากมีค่าต่ำกว่า 0.1
        //     // if (tempCanvasHeight > 0.1 && tempCanvasHeight < 0.5) {
        //     //     tempCanvasHeight = 1; // กำหนดค่าเป็น 1
        //     // }
        
        //     // console.log(`Page ${i}: startY = ${startY}, remainingHeight = ${remainingHeight}, tempCanvasHeight = ${tempCanvasHeight}`);
        
        //     // ตรวจสอบความสูงก่อนสร้าง tempCanvas
        //     if (tempCanvasHeight > 0) {
        //         const tempCanvas = document.createElement('canvas');
        //         tempCanvas.width = canvasWidth;
        //         tempCanvas.height = tempCanvasHeight;
        //         // console.log( "tempCanvas.height",tempCanvas.height)
        
        //         const tempCtx = tempCanvas.getContext('2d');
        //         if (tempCtx) {
        //             // console.log("Drawing image onto tempCanvas...", tempCtx);
        //             tempCtx.drawImage(canvas, 0, startY, canvasWidth, tempCanvasHeight, 0, 0, canvasWidth, tempCanvasHeight);
        
        //             // ตรวจสอบข้อมูลใน tempCanvas หลังจาก drawImage
        //             const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        //             if (imageData.data.length === 0 || imageData.data.every(channel => channel === 0)) {
        //                 console.warn('No image data in tempCanvas, skipping this page.');
        //                 continue; // ข้ามหน้า PDF ที่ไม่มีข้อมูล
        //             }
        
        //             const tempImgData = tempCanvas.toDataURL('image/png');
        
        //             if (tempImgData) {
        //                 try {
        //                     if (imageData.data.some(channel => channel !== 0)) {
        //                         if (index > 0 || i > 0) {
        //                             pdf.addPage();
        //                         }
        //                         pdf.addImage(tempImgData, 'PNG', 0, 0, pdfWidth, tempCanvas.height / ratio);
        //                     } else {
        //                         console.warn('No visible content found in tempCanvas, skipping page generation.');
        //                     }
        //                 } catch (error) {
        //                     console.error('Error with getImageData or canvas rendering:', error);
        //                 }
        //             }
        //         } else {
        //             console.error('Failed to get 2D context from tempCanvas.');
        //         }
        //     } else {
        //       // return
        //         console.warn(`Skipping page ${i} due to tempCanvasHeight being 0.`);
        //     }
        // }
        //   //////////////////////////////////////////////////////////////////////////////////
          
  
        // });
        
        //     console.log("data person: ",person)
        
          
        //   ////////////////////////////////////////////////////////////////
        // }).catch((error) => {
        //   // return
        //   console.error('Error generating PDF:', error);
        // }));
      } else {
        console.warn(`No person data found for index: ${index}`);
      }
    });



    Promise.all(promises).then(() => {
      // Convert the PDF to Blob
      const pdfBlob = pdf.output('blob');

      // Create FormData to send the PDF to the backend
      const formData = new FormData();
      const pdfFilename = 'การลงตรวจสอบ.pdf'; // Change to the desired filename
      formData.append('id', this.recordId); // Adjust the ID as needed
      formData.append('pdf', pdfBlob, pdfFilename);

      //////////////////////////////////////////
      formData.append('status', statusToSend.toString()); // Convert to string
      //////////////////////////////////////////////////////////

      // Check if this.sv.savePDF exists and is a function
      if (typeof this.sv !== 'undefined' && typeof this.sv.savePDF === 'function') {
        // Send the PDF to the backend
        this.sv.savePDF(formData).subscribe(
          response => {
            this.saveCount++; // Increment saveCount on successful save
            console.log("PDF saved successfully " + this.saveCount + " times:", response); // Log success count

            // Show success notification
            this.toastr.success('บันทึกข้อมูลสำเร็จ', 'สำเร็จ!!', {
              timeOut: 1500,
              positionClass: 'toast-top-right',
            });
            console.log("ข้อมูลการส่ง : ", statusToSend)
            // เพิ่มการอัปเดตสถานะที่นี่
            this.updateRecordStatus(this.recordId, statusToSend); // อัปเดตสถานะเป็น 1
            // Navigate to another page (or refresh if you prefer)
            // setTimeout(() => {
            //   this.router.navigate(['/table-main']);
            // }, 1500); // Matches the Toastr notification timeout
          },
          error => {
            console.error('Error saving PDF:', error);

            // Show error notification
            this.toastr.error('บันทึกข้อมูลไม่สำเร็จ', 'ผิดพลาด!', {
              timeOut: 1500,
              positionClass: 'toast-top-right',
            });
          }
        );
      } else {
        console.error('savePDF function is not defined or not a function');
      }
    }).catch((error) => {
        // Show error notification
        this.toastr.error('บันทึกข้อมูลไม่สำเร็จ', 'ผิดพลาด!', {
          timeOut: 1500,
          positionClass: 'toast-top-right',
        });
      // return
      console.error('Error generating PDF:', error);

    
    });


  }

  // เมธอดสำหรับอัปเดตสถานะ


  private addCanvasToPDF(pdf: jsPDF, canvas: HTMLCanvasElement, pdfWidth: number, pdfHeight: number, newPage: boolean = false) {
    const imgData = canvas.toDataURL('image/png');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const pdfCanvasHeight = canvasHeight / ratio;
    const numOfPages = Math.ceil(pdfCanvasHeight / pdfHeight);

    for (let i = 0; i < numOfPages; i++) {
      const startY = i * pdfHeight * ratio;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = Math.min(canvasHeight - startY, pdfHeight * ratio);

      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, startY, canvasWidth, tempCanvas.height, 0, 0, canvasWidth, tempCanvas.height);

      const tempImgData = tempCanvas.toDataURL('image/png');

      if (tempImgData && tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data.some(channel => channel !== 0)) {
        if (newPage || i > 0) {
          pdf.addPage();
        }
        pdf.addImage(tempImgData, 'PNG', 0, 0, pdfWidth, (tempCanvas.height / ratio));
      }
    }
  }
  updateRecordStatus(recordId: string, status: number) {
    // ตรวจสอบว่าบริการที่เรียกใช้งานถูกต้อง
    if (typeof this.sv !== 'undefined' && typeof this.sv.updateStatusDocument === 'function') {
      this.sv.updateStatusDocument(recordId, status).subscribe(
        response => {
          console.log("Status updated successfully:", response);
        },
        error => {
          console.error('Error updating status:', error);
        }
      );
    } else {
      console.error('updateStatus function is not defined or not a function');
    }
  }


  test() {
    alert("1")
  }

  generateQRCode(): void {
    if (this.recordId) {
      const urlToEncode = `http://localhost:4200/#/table-detail/${this.recordId}`;
      QRCode.toDataURL(urlToEncode, (err, url) => {
        if (err) {
          console.error(err);
        } else {
          this.qrCodeUrl = url;
        }
      });
    } else {
      console.error('Detail ID is empty.');
    }
  }
}
