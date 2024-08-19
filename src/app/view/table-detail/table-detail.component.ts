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

  details: any[] = []; //break page

  textContentLength: number = 0;
  remainingContentLength: number = 0;
  contentParts: SafeHtml[] = [];


  recordId: any;
  viewData:any[] = [];
  remainingContent: string = '';//content ที่ตัดออกจะเก็บที่นี้?
  otherRemainingContent: string = '';//content ที่ตัดออกจะเก็บที่นี้? ระดับ 3
  isContentOverflow = false; //
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
    private authService: AuthService
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
      console.log("recordID it send? >",this.recordId); // ทดสอบการดึงค่า id
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

  //////////////////////////////////////////////////////////////////////
  setupSignCanvas(index: number) {
    console.log("index sign: " ,index);
    
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

          const rect =  canvasFind.getBoundingClientRect();
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
      console.error('Sign canvas element not found',  canvasitem);
    }
  }

  refreshCanvas(index) {
    let canvasFind = this.canvasList.find(x => x.id == `writteSignCanvas-${index}`)
    let ctxFind = this.ctxList.find(x => x.canvas?.id == `writteSignCanvas-${index}`)
    if (ctxFind) {
      ctxFind.clearRect(0, 0, canvasFind.width, canvasFind.height);
    }
  }


  openSignModalx(i){
    console.log("openSignModalx  x "+ i);
    
  }

  openSignModal(index: number) {
     console.log("Sign modal is work index: >", index );


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
    },0);

   
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

  //move element 2 ถ้าเปิดมาจะไม่สามารถ ใช้ openSignModal ไม่ได้
  // @HostListener('mousedown', ['$event'])
  // onMouseDown(event: MouseEvent, index: number): void {
  //   event.preventDefault();
  //   const box = this.boxes[index];
  //   if (!box) {
  //     console.error('Box not found at index mouse:', index);
  //     return;
  //   }
  //   console.log('Box before drag:', box);

  //   box.dragStartX = event.clientX - box.left;
  //   box.dragStartY = event.clientY - box.top;

  //   const onMouseMove = (moveEvent: MouseEvent) => {
  //     box.left = moveEvent.clientX - box.dragStartX;
  //     box.top = moveEvent.clientY - box.dragStartY;
  //   };

  //   const onMouseUp = () => {
  //     document.removeEventListener('mousemove', onMouseMove);
  //     document.removeEventListener('mouseup', onMouseUp);
  //     console.log('Box after drag:', box);
  //   };

  //   document.addEventListener('mousemove', onMouseMove);
  //   document.addEventListener('mouseup', onMouseUp);
  // }

  // @HostListener('document:mouseup')
  // onMouseUp(): void {
  //   this.isDragging = false;
  // }

  // @HostListener('document:mousemove', ['$event'])
  // onMouseMove(event: MouseEvent): void {
  //   if (this.isDragging) {
  //     const x = event.clientX - this.offsetX;
  //     const y = event.clientY - this.offsetY;
  //     this.renderer.setStyle(this.el.nativeElement, 'transform', `translate(${x}px, ${y}px)`);
  //   }
  // }

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
    console.log("mainDetailElement :",mainDetailElement);
    
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
    if(!content){
      console.log("no content ", content);
      return "";
    }
    const maxLength = 1520;
    const AddLength = 900;
    const textcontent = content?.substring(0, maxLength);
    
    this.remainingContent = content?.substring(maxLength);

    // this.otherRemainingContent = this.remainingContent.substring(3050)
    // this.textContentLength = textcontent.length; 
    // this.remainingContentLength = this.remainingContent.length;

    this.contentParts = this.splitContent(this.remainingContent,maxLength+AddLength);
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

    const refreshButton = document.querySelector('.btn-refreshCanvas') as HTMLElement;
    if (refreshButton) {
        refreshButton.style.display = 'none';
    }
    elements.forEach((element, index) => {
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

  async saveRCPDF() {
    console.log("Updating PDF in dictionary...");
    const elements = document.querySelectorAll('.modal-body-detail');
    const pdfViewerElement = document.getElementById('pdf-viewer');

    if (!pdfViewerElement && elements.length === 0) {
      console.error('No elements found to print.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    let promises = [];

    html2canvas(pdfViewerElement, { scale: 5 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const pdfCanvasHeight = canvasHeight / ratio;
      const numOfPages = Math.ceil(pdfCanvasHeight / pdfHeight);

      for (let i = 0; i < numOfPages; i++) {
        const startY = i * pdfHeight * ratio;

        // Create a temporary canvas to draw each part
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = Math.min(canvasHeight - startY, pdfHeight * ratio);

        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, startY, canvasWidth, tempCanvas.height, 0, 0, canvasWidth, tempCanvas.height);

        const tempImgData = tempCanvas.toDataURL('image/png');

        // Check if the image data is not blank
        if (tempImgData && tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data.some(channel => channel !== 0)) {
          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(tempImgData, 'PNG', 0, 0, pdfWidth, (tempCanvas.height / ratio));
        }
      }
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
    const refreshButton = document.querySelector('.btn-refreshCanvas') as HTMLElement;
    if (refreshButton) {
        refreshButton.style.display = 'none';
    }
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement; // Cast Element to HTMLElement
      htmlElement.style.border = 'none';
      htmlElement.style.borderCollapse = 'collapse';
      promises.push(html2canvas(htmlElement, { scale: 5 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const pdfCanvasHeight = canvasHeight / ratio;
        const numOfPages = Math.ceil(pdfCanvasHeight / pdfHeight);

        for (let i = 0; i < numOfPages; i++) {
          const startY = i * pdfHeight * ratio;

          // Create a temporary canvas to draw each part
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasWidth;
          tempCanvas.height = Math.min(canvasHeight - startY, pdfHeight * ratio);

          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(canvas, 0, startY, canvasWidth, tempCanvas.height, 0, 0, canvasWidth, tempCanvas.height);

          const tempImgData = tempCanvas.toDataURL('image/png');

          // Check if the image data is not blank
          if (tempImgData && tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data.some(channel => channel !== 0)) {
            if (index > 0 || i > 0) {
              pdf.addPage();
            }
            pdf.addImage(tempImgData, 'PNG', 0, 0, pdfWidth, (tempCanvas.height / ratio));
          }
        }
      }).catch((error) => {
        console.error('Error generating PDF:', error);
      }));
    });

    Promise.all(promises).then(() => {
      // Convert the PDF to Blob
      const pdfBlob = pdf.output('blob');

      // Create FormData to send the PDF to backend
      const formData = new FormData();
      const pdfFilename = 'การลงตรวจสอบ.pdf'; // Change to the desired filename
      formData.append('id', this.recordId); // Adjust the ID as needed
      formData.append('pdf', pdfBlob, pdfFilename);

      // Check if this.sv.savePDF exists and is a function
      if (typeof this.sv !== 'undefined' && typeof this.sv.savePDF === 'function') {
        // Send the PDF to the backend
        this.sv.savePDF(formData).subscribe(
          response => {
            console.log('PDF saved successfully:', response);
            this.router.navigate(['/table-main']);
          },
          error => {
            console.error('Error saving PDF:', error);
          }
        );
      } else {
        console.error('savePDF function is not defined or not a function');
      }
    });

    $('#myModal').modal('hide');
  }
  //   saveRCPDF = () => {
  //   console.log("Updating PDF in dictionary...");
  //   // const pdfViewerElement = document.getElementById('pdf-viewer');
  //   const elements = document.querySelectorAll('.modal-body-detail');

  //   if (!elements.length) {
  //     console.error('Elements to print not found');
  //     return;
  //   }

  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const pdfWidth = 210; // A4 width in mm
  //   const pdfHeight = 297; // A4 height in mm

  //   let promises = [];

  //   elements.forEach((element, index) => {
  //     const htmlElement = element as HTMLElement; // Cast Element to HTMLElement
  //     htmlElement.style.border = 'none';
  //     htmlElement.style.borderCollapse = 'collapse';
  //     promises.push(html2canvas(htmlElement, { scale: 5 }).then((canvas) => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const canvasWidth = canvas.width;
  //       const canvasHeight = canvas.height;
  //       const ratio = canvasWidth / pdfWidth;
  //       const pdfCanvasHeight = canvasHeight / ratio;
  //       const numOfPages = Math.ceil(pdfCanvasHeight / pdfHeight);

  //       for (let i = 0; i < numOfPages; i++) {
  //         const startY = i * pdfHeight * ratio;

  //         // Create a temporary canvas to draw each part
  //         const tempCanvas = document.createElement('canvas');
  //         tempCanvas.width = canvasWidth;
  //         tempCanvas.height = Math.min(canvasHeight - startY, pdfHeight * ratio);

  //         const tempCtx = tempCanvas.getContext('2d');
  //         tempCtx.drawImage(canvas, 0, startY, canvasWidth, tempCanvas.height, 0, 0, canvasWidth, tempCanvas.height);

  //         const tempImgData = tempCanvas.toDataURL('image/png');

  //         // Check if the image data is not blank
  //         if (tempImgData && tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data.some(channel => channel !== 0)) {
  //           if (index > 0 || i > 0) {
  //             pdf.addPage();
  //           }
  //           pdf.addImage(tempImgData, 'PNG', 0, 0, pdfWidth, (tempCanvas.height / ratio));
  //         }
  //       }
  //     }).catch((error) => {
  //       console.error('Error generating PDF:', error);
  //     }));
  //   });

  //   Promise.all(promises).then(() => {
  //     // Convert the PDF to Blob
  //     const pdfBlob = pdf.output('blob');

  //     // Create FormData to send the PDF to backend
  //     const formData = new FormData();
  //     const pdfFilename = 'การลงตรวจสอบ.pdf'; // Change to the desired filename
  //     formData.append('id', this.recordId); // Adjust the ID as needed
  //     formData.append('pdf', pdfBlob, pdfFilename);

  //     // Check if `this.sv.savePDF` exists and is a function
  //     if (typeof this.sv !== 'undefined' && typeof this.sv.savePDF === 'function') {
  //       // Send the PDF to the backend
  //       this.sv.savePDF(formData).subscribe(
  //         response => {
  //           console.log('PDF saved successfully:', response);
  //           this.router.navigate(['/table-list']);
  //         },
  //         error => {
  //           console.error('Error saving PDF:', error);
  //         }
  //       );
  //     } else {
  //       console.error('savePDF function is not defined or not a function');
  //     }
  //   });

  //   $('#myModal').modal('hide');
  // }

  test(){
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
