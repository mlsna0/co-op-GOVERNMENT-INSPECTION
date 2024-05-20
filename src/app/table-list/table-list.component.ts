import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule,FormControl,FormBuilder, Validator } from '@angular/forms';
import $ from "jquery";
import 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import { SharedService } from "../services/shared.service"


@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  people:any[] =[];
  //ListUser: users[] =[];
  Form:FormGroup;
  addRecordForm:FormGroup;
  addPersonalForm:FormGroup;

  items:any[]= [];
  PersonINT :number = 0;
  personInputs: number[]=[];
addItemForm: any;
addDataForm: any;
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
  
  
  openModal() {
    $('#myModal').modal('show');

    this.sv.getData().subscribe(res => {
      console.log("res getData:", res);
    });

    this.sv.postData({
      key1: "",
      key2: ""
    }).subscribe(res => {
      console.log("res postData:", res);
    });
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
    
    // console.log(this.items);
    // ส่งข้อมูลไปยัง controller

    // this.sv.postItemData(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
    //   console.log("res postItemData:", res);
    // });
    this.sv.postDataTest(this.addItemForm.value,this.addPersonalForm.value).subscribe(res => {
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
  ngOnInit() {
    this.Form =this.fb.group({
      Full_name1: new FormControl(""),
      Full_name2: new FormControl(""),
      Full_name3: new FormControl("")
    })
  }

  searchData(data: string) {
    this.sv.searchData(data).subscribe(res => {
      console.log("res searchData:", res);
    });
  }
  fetchItems() {
    this.sv.getItems().subscribe(
      res => {
        this.items = res;
        console.log('Items fetched successfully:', this.items);
      },
      error => {
        console.error('Error fetching items:', error);
      }
    );
  }
}
