  /// <reference types="googlemaps" />
  import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
  import { FormGroup, FormsModule,FormControl,FormBuilder, Validators } from '@angular/forms';
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


  @Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.css']
  })
  export class TableListComponent implements OnInit {
    people:any[] =[];
    @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
    //ListUser: users[] =[];
    Form:FormGroup;
    dtOptions:any ={};
    addRecordForm:FormGroup;
    addPersonalForm:FormGroup;
    showPdfButton: boolean = false;
    items:any= [];
    detailItems: any;
    PersonINT :number = 0;
    personInputs: number[]=[];
    addItemForm: any;
    addDataForm: any;
    activeButton: string='';
    isTyproActive:boolean = false;
    isWritteActive:boolean = false;
    typroText: string='';
    selectedRowIndex: number | null = null;
    uploadedImageUrl: string | ArrayBuffer | null = null;
    uploadedImageFile: File | null = null;
    confirmedImageUrl: string | ArrayBuffer | null = null;
    confirmed: boolean = false;
    map: google.maps.Map;
    marker: google.maps.Marker;
    isLoading: boolean = false;
    
    constructor(
      private fb:FormBuilder,
      private http:HttpClient,
      private sv:SharedService
    ) { 
      this.addItemForm = this.fb.group({
        id: ['',Validators.required],
        startDate: ['',Validators.required],
        detail:['',Validators.required],
        endDate: ['',Validators.required],
        location: ['',Validators.required],
        topic: ['',Validators.required]
      }); 
      this.addPersonalForm = this.fb.group({  
        rank: ['',Validators.required],
        fullname: ['',Validators.required],
      }); 
    }
    documentImageUrl = 'assets/img/sampleA4-1.png';
    itemsTest:any[]= [
      {
        id:'1', startDate:'20/05/2567',endDate:'26/05/2567',location:'data testing'
      },
      {
        id:'2', startDate:'30/05/2567',endDate:'01/06/2567',location:'data testing'
      }

    ];
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

    onRowSelect(index: number) {
      this.selectedRowIndex = index;
    }
    ngOnInit() {

    
      this.Form =this.fb.group({
        Full_name1: new FormControl(""),
        Full_name2: new FormControl(""),
        Full_name3: new FormControl("")
      })
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
        this.detailItems = res.details;
        
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
        this.detailItems.views = res.views; // ตรวจสอบว่าข้อมูลที่ถูกดึงมาถูกต้อง
        this.items.forEach((item, index) => {
          if (item.id === recordId) {
            item.picher = this.confirmedImageUrl; // เก็บ URL ของรูปภาพที่ยืนยันในฟิลด์ picher
          }
        });
        console.log("it on working.. ")
      })
  
    }
    
    uploadImage(): void {
      const input = document.getElementById('image-upload') as HTMLInputElement;
      if (input) {
        input.click(); // เปิด dialog เพื่ออัพโหลดรูปภาพ
      }
    }

    onFileChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadedImageUrl = reader.result;
          this.isLoading = true;
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
    this.personInputs = Array(this.PersonINT).fill(1).map((x, i) => i);
    console.log(this.PersonINT);
    


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
      console.log(this.addItemForm.value);
      console.log(this.addPersonalForm.value);
      console.log("onInsertSubmit..?",data);
      // console.log(this.addPersonalForm.value);
      if (this.addItemForm.invalid || this.addPersonalForm.invalid) {
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
      // console.log(this.items);
      // ส่งข้อมูลไปยัง controller

      // this.sv.postItemData(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
      //   console.log("res postItemData:", res);
      // });
      this.sv.postDataTest(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
        console.log("res postItemData:", res);
      });

      // Close the modal
      $('#insertModel').modal('hide');
          
      // Show success alert
      $('#insertModel').on('hidden.bs.modal', function () {
        Swal.fire({
          title: 'Success!!',
          text: 'Your data has been submitted successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
      })
    });
      // if (this.addItemForm.valid) {
      //   this.items.push(this.addItemForm.value);
      //   this.addItemForm.reset();
      //   // console.log(this.items);
      //   // ส่งข้อมูลไปยัง controller
      //   this.sv.postItemData(this.items).subscribe(res => {
      //     console.log("res postItemData:", res);
      //   });
      // }
      this.sv.getData().subscribe(res => {
        console.log("res getData:", res);
        this.items = res;
        this.detailItems = res.details;
        
      });
    }
    
    // initMap() {
    //   const mapOptions = {
    //     center: new google.maps.LatLng(13.7563, 100.5018), // Default center to Bangkok
    //     zoom: 8
    //   };
    //   this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    //   this.marker = new google.maps.Marker({
    //     map: this.map,
    //     draggable: true,
    //     animation: google.maps.Animation.DROP,
    //   });

    //   google.maps.event.addListener(this.map, 'click', (event: any) => {
    //     this.placeMarker(event.latLng);
    //   });
    // }

    // placeMarker(location: google.maps.LatLng) {
    //   this.marker.setPosition(location);
    //   this.addItemForm.patchValue({
    //     location: `Lat: ${location.lat()}, Lng: ${location.lng()}`
    //   });
    // }

    // // Show map modal and initialize map
    // showMapModal() {
    //   $('#mapModal').modal('show');
    //   setTimeout(() => {
    //     this.initMap();
    //   }, 1000); // Delay to ensure the modal is fully shown
    // }
    // ดึงโลเคชั่นปัจจุบันเมื่อเปิดโมดอล
showLocationModal() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        // อัปเดตฟอร์มด้วยโลเคชั่นปัจจุบัน
        this.addItemForm.patchValue({
          location: `Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}`
        });

        // แสดงโลเคชั่นในคอนโซล (สามารถลบได้หากไม่ต้องการ)
        console.log(`Current Location: Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}`);
      },
      (error) => {
        console.error('Error getting user location:', error);
        // แสดงข้อผิดพลาดหากไม่สามารถดึงโลเคชั่นได้
        alert('Unable to retrieve your location. Please enable location services and try again.');
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
    alert('Geolocation is not supported by your browser.');
  }
}

    
    //insert end here
    detailCommit(): void {
      // this.isLoading = true;
  
      if (!this.uploadedImageUrl) {
        Swal.fire({
          title: 'Error!',
          text: 'กรุณาอัพโหลดรูปภาพก่อน.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      this.confirmedImageUrl = this.uploadedImageUrl;
      this.confirmed = true; // ตั้งค่า confirmed เป็น true เพื่อลบไอคอน
      $('#myModal').modal('hide');
      Swal.fire({
        title: 'Success!',
        text: 'รูปภาพถูกยืนยันเรียบร้อยแล้ว.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
  
      setTimeout(() => {
        // สิ้นสุดการโหลด
        this.isLoading = true;
      }, 2000);
    }

    recordCommit(){
      

    
    }
    generatePDF(){
  
    }
    printPDF(){
      console.log("working PDF..")
      const elementToPrint = document.getElementById('myModal');
      html2canvas(elementToPrint,{scale:2}).then((canvas)=>{
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PDF',0 ,0,297,210);
        pdf.save('record.pdf')
      });
    }
    

    searchData(data: string) {
      this.sv.searchData(data).subscribe(res => {
        console.log("res searchData:", res);
      });
    }
  
  }
