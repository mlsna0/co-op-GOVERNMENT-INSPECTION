import { Component, OnInit,  ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { loginservice } from "app/layouts/login.services.";
import Swal from "sweetalert2";

import { ThaiApiAddressService } from '../../../services/thai-api-address.service'
import { ProvinceService } from "app/view/thaicounty/thaicounty.service";
import { ToastrService } from 'ngx-toastr'; // นำเข้า ToastrService
@Component({
  selector: 'app-addagency',
  templateUrl: './addagency.component.html',
  styleUrls: ['./addagency.component.css']
})
export class AddagencyComponent implements OnInit {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string; // เพิ่มบรรทัดนี้
  phone: string;
  agenForm: any;
  Submitted:boolean=false;

  provinces: any[] = [];
  amphures: any[] = [];
  
  tambons: any[] = [];
  nameTambons: string[] = [];

  zipCode: any[] = [];
  selectedProvince: any = null;
  selectedTambon: any = null;
  selectedAmphures: any = null;
  postCode: any[] = [];

  filteredAmphures = [];
  filteredTambons = [];

  isAmphureDisabled = true;
  isTambonDisabled = true;
  isPostCodeDisabled = true;

  imageSrc: string | ArrayBuffer | null = null;
  profileImage: string| ArrayBuffer | null = null;
  
  constructor(
    private fb: FormBuilder,
    private lc: loginservice,
    private router: Router,
   
    private ts :ProvinceService,
    private toastr: ToastrService // เพิ่ม ToastrService ใน constructor
  ) {
    this.agenForm = this.fb.group({
      agency_name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required, Validators.pattern('^[0-9]{10}$')],
      address:["", Validators.required],
      province: ['', Validators.required],
      amphure: ['', Validators.required],
      tambon: ['', Validators.required],
      postCode: ['', Validators.required],
  
      // profileImage: ['']
    })
  }  

  ngOnInit(): void {
    // this.loadProvinces();
    // this.loadAmphures();
    // this.loadTambon()

    this.loadProvinces(); // Load provinces when the component initializes
  }


  onSubmit(data) {
    console.log('data:',data)
    this.Submitted = false; 
   
    // const formData = new FormData();
    // Object.keys(this.agenForm.controls).forEach(key => {
    //   formData.append(key, this.agenForm.get(key)?.value);
    // });
   

    this.lc.agency(data).subscribe(
      (response) => {
        console.log("User postagency successfully", response);
        Swal.fire({
          title: "ลงทะเบียนสำเร็จ!",
          text: "ผู้ใช้ถูกลงทะเบียนเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "custom-confirm-button",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            document.querySelector(".swal2-confirm")?.setAttribute(
              "style",
              "background-color: #24a0ed; color: white;"
            );
            this.router.navigate(["/addagency"]);
          }
        })
      },
      (error) => {
        console.error("Error registering user", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้",
          icon: "error",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "custom-confirm-button",
          },
        });
      } 
    );

  }

  loadProvinces() {
    this.ts.getProvincesWithDetails().subscribe(data => {
      this.provinces = data;
    });
  }

  onProvinceChange(provinceId: number) {
    this.agenForm.controls['amphure'].setValue('');
    this.agenForm.controls['tambon'].setValue('');
    this.filteredTambons = [];

    this.isAmphureDisabled = !provinceId;
    this.isTambonDisabled = true;
    this.isPostCodeDisabled = true;

    this.loadAmphures(provinceId); 
  }
  

  loadAmphures(provinceId: any) {
    this.ts.getamphures().subscribe(data => {
      this.amphures = data.filter(amphure => amphure.province_id === parseInt(provinceId));
      this.filteredAmphures = this.amphures;
    });
  }

  onAmphuresChange(amphureId: any) {
    this.agenForm.controls['tambon'].setValue('');

    this.isTambonDisabled = !amphureId;
    this.isPostCodeDisabled = true;

    this.loadTambons(amphureId,); // Load tambons for the selected amphure
  }

  loadTambons(amphureId: any) {
    this.ts.gettambons().subscribe(data => {
      this.tambons = data.filter(tambon => tambon.amphure_id === parseInt(amphureId));
      this.filteredTambons = this.tambons;
      this.nameTambons = this.tambons.map(tambon => tambon.name_th);
    });
  }

  onTambonChange(tambonId: any) {
    const selectedTambon = this.filteredTambons.find(tambon => tambon.id === parseInt(tambonId));
    if (selectedTambon) {
      this.zipCode = selectedTambon.zip_code;
      this.postCode = [this.zipCode]; // Update postCode as an array
      this.isPostCodeDisabled = false;
    }
  }


  deletedFileUpload(fileInput:  ElementRef){
    this.imageSrc = null;
    fileInput.nativeElement.value = '';
    this.agenForm.patchValue({
      profileImage: null
    });
  }


onFileUploadImgChange(event: any) {
  const file = event.target.files[0];
  console.log("file",file);
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageSrc = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}


}