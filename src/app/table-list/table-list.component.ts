import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validator } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../services/shared.service"
import { DataTableDirective } from 'angular-datatables'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Subject } from 'rxjs'; //petch เพิ่มขค้นมาเพราะจะทำ datatable
import { Items } from '../../../server/models/itemModel';



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

  items:any[]= [];
  PersonINT :number = 0;
  personInputs: number[]=[];
  addItemForm: any;
  addDataForm: any;
  activeButton: string='';
  isTyproActive:boolean = false;
  isWritteActive:boolean = false;
  typroText: string='';

  
  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private sv:SharedService
  ) { 
    this.addItemForm = this.fb.group({
      id: [''],
      startDate: [''],
      detail:[''],
      endDate: [''],
      location: [''],
      topic: ['']
    }); 
    this.addPersonalForm = this.fb.group({
      rank: [''],
      fullname: [''],
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
  openModal() {
    $('#myModal').modal('show');

    this.sv.getData().subscribe(res => {
      console.log("res getData:", res);
      this.items = res;
     
    });

    // this.sv.postData({
    //   key1: "",
    //   key2: ""
    // }).subscribe(res => {
    //   console.log("res postData:", res);
    // });
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
      
    console.log("onInsertSubmit..?",data);
    // console.log(this.addPersonalForm.value);
    
    // console.log(this.items);
    // ส่งข้อมูลไปยัง controller

    // this.sv.postItemData(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
    //   console.log("res postItemData:", res);
    // });
  
    this.sv.postDataTest(data).subscribe(res => {
      console.log("res postItemData:", res);
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
  detailCommit(){

  }
  recordCommit(){
    

  
  }
  printPDF(){

  }


  searchData(data: string) {
    this.sv.searchData(data).subscribe(res => {
      console.log("res searchData:", res);
    });
  }

}
