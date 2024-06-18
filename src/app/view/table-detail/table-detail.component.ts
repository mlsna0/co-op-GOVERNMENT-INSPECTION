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

  recordId: any;
  viewData=[];
 
  addItemForm: any;
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;
  detailItems: any = {}; 

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
      fullname: ['',Validators.required],
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
