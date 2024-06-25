import { Component, OnInit ,ChangeDetectorRef, ViewChildren,ElementRef,HostListener,Renderer2 } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { SharedService } from "../../services/shared.service";
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Items } from '../../../../server/models/itemModel';
import { SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import  html2canvas from 'html2canvas';
import { ElementContainer } from 'html2canvas/dist/types/dom/element-container';
import { Router } from '@angular/router';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { environment } from 'environments/environment';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser'; //Typro and show of Detail
import { ActivatedRoute } from '@angular/router';

import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';


// import { PdfViewerModule } from 'ng2-pdf-viewer';




@Component({
  selector: 'app-table-detail',
  templateUrl: './table-detail.component.html',
  styleUrls: ['./table-detail.component.css']
})
export class TableDetailComponent implements OnInit {
  @ViewChildren('writteSignElement') writteSignElement!: ElementRef;

  textContentLength:number =0;
  recordId: any;
  viewData=[];
  remainingContent: string = '';//content ที่ตัดออกจะเก็บที่นี้?
  addItemForm: any;
  
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;
  detailItems: any = {};
  displayedContent: string = '';
  truncatedContent:string = '';
  maxLength: number = 250;


  uploadedPDF: SafeResourceUrl | undefined;
  selectedFile: any ="";
  selectedFilePath:String ="";
  selectedFileB64:string ="";
  isFileImage =false;
  isFileDocument =false;

  isSignModalVisible: boolean[] = [];
  private canvas2: HTMLCanvasElement;
  private ctx2: CanvasRenderingContext2D;
  penColor2: string = 'black';
  penSize2: number = 1;

  //move element
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  testFile:any;


  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private router: Router,
    private ACrouter: ActivatedRoute,   
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private pdfService:NgxExtendedPdfViewerService,
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    

    this.ACrouter.paramMap.subscribe(params => {
      this.recordId = params.get('id');
  
      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log(this.recordId); // ทดสอบการดึงค่า id
    });

     this.sv.getDataById(this.recordId).subscribe(res=>{
      console.log("getDataById :",res);
      
      this.detailItems =res;

    
      console.log("it on working.. ")
      if (this.detailItems && this.detailItems.record_content) {
          // this.truncateAndStoreContent(this.detailItems.record_content, 250);
      }
      console.log("Displayed content:", this.displayedContent);
      console.log("Truncated content:", this.truncatedContent);

    });

   
    this.sv.getViewByRecordId(this.recordId).subscribe((res :any)=>{
        console.log("getDataById :",res);
        
        this.viewData = res;
      
        console.log("it on working.. ")
       
        
      });
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

  //open file pdf to preview or edit to sign
  async onFileSelected(event: any){
    this.selectedFile = event.target.files[0]?? null;
    if(this.selectedFile){
      this.testFile = await this.blobToBase64(event.target.files[0])
      console.log("test file : ",this.testFile);
      

      var reader =new FileReader();
      console.log("event.target.files[0] : ",event.target.files[0]);
      reader.readAsDataURL(event.target.files[0]);
      
      reader.onload =(event)=>{
        let path =event.target == null ? '':event.target.result;
        this.selectedFilePath = path as string;
        this.selectedFileB64 = this.selectedFilePath.split(",")[1];
        this.testFile = reader.result;
        if(this.selectedFilePath.includes('image')){
          this.isFileImage = true;
          this.isFileDocument = false;
          
         
        }else{
          this.isFileImage = false;
          this.isFileDocument = true;
        
        }
        console.log("this is files img: ",this.isFileImage)
        console.log("this is files Doc: ",this.isFileDocument)
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
    if (fileInput) {
      fileInput.value = '';
    }
  }

//move element
@HostListener('mousedown', ['$event'])
onMouseDown(event: MouseEvent): void {
  this.isDragging = true;
  const rect = this.el.nativeElement.getBoundingClientRect();
  this.offsetX = event.clientX - rect.left;
  this.offsetY = event.clientY - rect.top;
  event.preventDefault();
}

@HostListener('document:mouseup')
onMouseUp(): void {
  this.isDragging = false;
}

@HostListener('document:mousemove', ['$event'])
onMouseMove(event: MouseEvent): void {
  if (this.isDragging) {
    const x = event.clientX - this.offsetX;
    const y = event.clientY - this.offsetY;
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translate(${x}px, ${y}px)`);
  }
}

//ิback to table-list
  BackRoot(){
    this.router.navigate(['/table-list']);
  }

  // truncateAndStoreContent(data: string, maxLength: number): void {
  //   if (data.length > maxLength) {
  //     this.displayedContent = data.substring(0, maxLength) + '...';
  //     this.truncatedContent = data.substring(maxLength);
  //   } else {
  //     this.displayedContent = data;
  //     this.truncatedContent = '';
  //   }

  // }
  // onMaxLengthChange(newMaxLength: number): void {
  //   this.maxLength = newMaxLength;
  //   if (this.detailItems && this.detailItems.record_content) {
  //     this.truncateAndStoreContent(this.detailItems.record_content, this.maxLength);
  //   }
  // }


  //show content table
  getSafeHtml(content: string): SafeHtml {
    
    const textcontent = content.substring(0, 950);
    this.textContentLength = textcontent.length; 
    this.remainingContent = content.substring(950);
    console.log("textContent :",textcontent)
    console.log("textContent Count :",this.textContentLength)
    return this.sanitizer.bypassSecurityTrustHtml(textcontent);
    }

  // printPDF = () => {
  //     console.log("working PDF..");
  //     const elementToPrint = document.getElementById('myDetail');
  //     html2canvas(elementToPrint,{scale:2}).then((canvas)=>{
  //       const pdf = new jsPDF('p','mm','a4');
  //       pdf.addImage(canvas.toDataURL('image/png'), 'PDF',0 ,0,210,297);
  //       pdf.save('การลงตรวจสอบ.pdf')
  //     });
  //     // this.fetchData()
  // }

  printPDF = () => {
    console.log("working PDF..");
    const elementToPrint = document.getElementById('myDetail'); //,pdf-viewer
    const A4_WIDTH = 210; // Width of A4 in mm
    const A4_HEIGHT = 297; // Height of A4 in mm
    const canvasScale = 2; // Scale factor for higher resolution canvas

    const options = {
    scale: canvasScale,
    height: elementToPrint.scrollHeight,
    windowHeight: elementToPrint.scrollHeight
    };

    html2canvas(elementToPrint, options).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = A4_WIDTH;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      const bottomMargin = 10; // ขอบล่างของ PDF ที่ต้องการเว้นว่าง (มิลลิเมตร)
      const textOffset = 5; // การเลื่อนข้อความลงมา (มิลลิเมตร)


      while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          pdf.text(' ', A4_WIDTH / 2, A4_HEIGHT - bottomMargin - textOffset, { align: 'center' });
          heightLeft -= A4_HEIGHT;

          if (heightLeft > 0) {
              pdf.addPage();
          }
          position -= A4_HEIGHT;
      }

      pdf.save('การลงตรวจสอบ.pdf');
    });
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
      formData.append('id', this.recordId); // Adjust the ID as needed
      formData.append('pdf', pdfBlob, pdfFilename);
  
      // Check if `this.sv.savePDF` exists and is a function
      if (typeof this.sv !== 'undefined' && typeof this.sv.savePDF === 'function') {
        // Send the PDF to the backend
        this.sv.savePDF(formData).subscribe(
          response => {
            console.log('PDF saved successfully:', response);
            this.router.navigate(['/table-list']);

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

}
// saveRCPDF = () => {
//   console.log("Updating PDF in dictionary...");
//   const elementToPrint = document.getElementById('myDetail');

//   if (!elementToPrint) {
//     console.error('Element to print not found');
//     return;
//   }

//   // Get screen dimensions
//   const screenWidth = window.innerWidth;
//   const screenHeight = window.innerHeight;

//   html2canvas(elementToPrint, { scale: 2 }).then((canvas) => {
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const imgData = canvas.toDataURL('image/png');

//     const pdfWidth = 210; // A4 width in mm
//     const pdfHeight = 297; // A4 height in mm

//     // Calculate the height of the PDF page based on screen dimensions
//     const screenRatio = screenWidth / screenHeight;
//     const pdfHeightBasedOnScreen = pdfWidth / screenRatio;

//     // Calculate the number of pages needed
//     const totalHeight = (canvas.height / screenHeight) * pdfHeight;
//     const numOfPages = Math.ceil(totalHeight / pdfHeight);

//     for (let i = 0; i < numOfPages; i++) {
//       const sourceY = i * screenHeight;
//       const pageHeight = (i + 1 === numOfPages) ? (totalHeight % pdfHeight) : pdfHeight;
//       const canvasHeight = (pageHeight / pdfHeight) * canvas.height;

//       // Create a temporary canvas to draw each part
//       const tempCanvas = document.createElement('canvas');
//       tempCanvas.width = canvas.width;
//       tempCanvas.height = canvasHeight;
//       const tempCtx = tempCanvas.getContext('2d');

//       // Draw the portion of the original canvas to the temporary canvas
//       tempCtx.drawImage(canvas, 0, sourceY, canvas.width, canvasHeight, 0, 0, canvas.width, canvasHeight);

//       // Convert the temporary canvas to an image
//       const tempImgData = tempCanvas.toDataURL('image/png');

//       // Add the image to the PDF
//       pdf.addImage(tempImgData, 'PNG', 0, 0, pdfWidth, pageHeight);
      
//       // Add a new page if it's not the last page
//       if (i < numOfPages - 1) {
//         pdf.addPage();
//       }
//     }

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
//   }).catch((error) => {
//     console.error('Error generating PDF:', error);
//   });
  
//   $('#myModal').modal('hide');
// }