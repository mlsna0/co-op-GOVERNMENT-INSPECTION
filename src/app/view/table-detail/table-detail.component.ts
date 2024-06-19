import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validators, FormArray,AbstractControl } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../../services/shared.service";
import { DataTableDirective } from 'angular-datatables'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { DataTablesModule } from "angular-datatables"; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Items } from '../../../../server/models/itemModel';
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
import { ActivatedRoute } from '@angular/router';




@Component({
  selector: 'app-table-detail',
  templateUrl: './table-detail.component.html',
  styleUrls: ['./table-detail.component.css']
})
export class TableDetailComponent implements OnInit {
  @ViewChildren('writteSignElement') writteSignElement!: ElementRef;

  recordId: any;
  viewData=[];
 
  addItemForm: any;
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;
  detailItems: any = {}; 

  isSignModalVisible: boolean[] = [];
  private canvas2: HTMLCanvasElement;
  private ctx2: CanvasRenderingContext2D;
  penColor2: string = 'black';
  penSize2: number = 1;


  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService,
    private router: Router,
    private ACrouter: ActivatedRoute,   
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.addItemForm = this.fb.group({
      id: ['',Validators.required],
      startDate: ['',Validators.required],
      detail:['',Validators.required],
      endDate: ['',Validators.required],
      location: ['',Validators.required],
      topic: ['',Validators.required],
      content:[''],
      filename: [''],
      place:['',Validators.required],
      // data_: [''],
      // contentType: [''],
       personal: this.fb.array([]),
      

    }); 
    this.addPersonalForm = this.fb.group({
      rank: ['',Validators.required],
      firstname: ['',Validators.required],
      lastname: ['',Validators.required],
    });

    this.ACrouter.paramMap.subscribe(params => {
      this.recordId = params.get('id');
  
      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log(this.recordId); // ทดสอบการดึงค่า id
    });

     this.sv.getDataById(this.recordId).subscribe(res=>{
      console.log("getDataById :",res);
      
      this.detailItems =res;
    
      console.log("it on working.. ")


    });
    this.sv.getViewByRecordId(this.recordId).subscribe((res :any)=>{
        console.log("getDataById :",res);
        
        this.viewData = res;
      
        console.log("it on working.. ")
       
        
      });
  }
  BackRoot(){
    this.router.navigate(['/table-list']);
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

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
    }

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