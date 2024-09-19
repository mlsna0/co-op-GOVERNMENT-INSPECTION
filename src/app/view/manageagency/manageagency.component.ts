import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

import { SharedService } from 'app/services/shared.service';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from 'ngx-toastr';
import { ClipEffect } from 'html2canvas/dist/types/render/effects';


@Component({
  selector: 'app-manageagency',
  templateUrl: './manageagency.component.html',
  styleUrls: ['./manageagency.component.css']
})
export class ManageagencyComponent implements OnInit {
  agency: any[] = [];
  
  dtOptions: any = {}; // datatable.setting = {}
  dtTrigger: Subject<any> = new Subject();
  loading: boolean = true;
  error: string = '';

  //for form
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

  constructor(
    private http: HttpClient,
    private ls: loginservice,
    private sv: SharedService,
    private router: Router,
    private fb: FormBuilder,
    private ts :ProvinceService,
    private toastr: ToastrService
  ) { 
    this.agenForm = this.fb.group({
      agency_name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address:["", Validators.required],
      province: ['', Validators.required],
      amphure: ['', Validators.required],
      tambon: ['', Validators.required],
      postCode: ['', Validators.required],
  
      // profileImage: ['']
    })
  }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[0, 'asc']],
      pagingType: 'full_numbers',
      language: {
        lengthMenu: 'แสดง _MENU_ รายการ',
        search: 'ค้นหา',
        info: 'แสดงหน้า _PAGE_ จากทั้งหมด _PAGES_ หน้า',
        infoEmpty: 'แสดง 0 ของ 0 รายการ',
        zeroRecords: 'ไม่พบข้อมูล',
        paginate: {
          first: 'หน้าแรก',
          last: 'หน้าสุดท้าย',
          next: 'ต่อไป',
          previous: 'ย้อนกลับ'
        }
      }
    };
    this.ls.getagency().subscribe(data => {
      this.agency = data
      this.loading = false;
      // console.log("agency data ",this.agency)
    }, error => {
      console.error('Error fetching user data:', error);
      this.loading = false;
    });
    this.loadProvinces() ;

  }

      getUserReportProfile(userId: any) {
    this.router.navigate(['/profileuser', userId]);
    }
    onSubmit(data) {
      console.log('data:',data)
      this.Submitted = true; 
      this.agenForm.markAllAsTouched();
      // const formData = new FormData();
      // Object.keys(this.agenForm.controls).forEach(key => {
      //   formData.append(key, this.agenForm.get(key)?.value);
      // });
      console.log("ข้อมูล invalid : ",this.agenForm.invalid)
      if (this.agenForm.invalid) {
        this.toastr.error('กรุณากรอกข้อมูลทุกช่อง', 'เกิดข้อผิดพลาด!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
        });
        return;
      }
     
  
      this.ls.agency(this.agenForm.value).subscribe(
        (response) => {
          console.log("User postagency successfully", response);
          this.toastr.success('เพิ่มข้อมูลสำเร็จ', 'สำเร็จ', {
            timeOut: 1500,  
            positionClass: 'toast-top-right'
          }).onHidden.subscribe(() => {
            window.location.reload();  // รีเฟรชหน้าจอหลังจากแจ้งเตือนหายไป
          });
        },
        (error) => {
          console.error("Error registering user", error);
          this.toastr.error('การเพิ่มข้อมูลไม่สำเร็จ', 'เกิดข้อผิดพลาด!', {
            timeOut: 1500,
            positionClass: 'toast-top-right'
          });
        } 
      );
  
    }

    // onSubmitUpdate(data){
    //   console.log('Update data:', data);
    //   this.Submitted = true; 
    //   this.agenForm.markAllAsTouched();
    
    //   if (this.agenForm.invalid) {
    //     this.toastr.error('กรุณากรอกข้อมูลทุกช่อง', 'เกิดข้อผิดพลาด!', {
    //       timeOut: 1500,
    //       positionClass: 'toast-top-right'
    //     });
    //     return;
    //   }
    // console.log("form Id to update: ", this.agenForm.value._id)
    
    //   // ตรวจสอบว่ามี ID หรือไม่
    //   if (data._id) {
    //     this.sv.UpdateOrganizationById(this.agenForm.value._id, this.agenForm.value).subscribe(
    //       (response) => {
    //         console.log("Agency updated successfully", response);
    //         this.toastr.success('อัปเดตข้อมูลสำเร็จ', 'สำเร็จ', {
    //           timeOut: 1500,
    //           positionClass: 'toast-top-right'
    //         }).onHidden.subscribe(() => {
    //           window.location.reload();  // รีเฟรชหน้าจอหลังจากแจ้งเตือนหายไป
    //         });
    //       },
    //       (error) => {
    //         console.error("Error updating agency", error);
    //         this.toastr.error('การอัปเดตข้อมูลไม่สำเร็จ', 'เกิดข้อผิดพลาด!', {
    //           timeOut: 1500,
    //           positionClass: 'toast-top-right'
    //         });
    //       }
    //     );
    //   } else {
    //     this.toastr.error('ไม่พบข้อมูลสำหรับการอัปเดต', 'เกิดข้อผิดพลาด!', {
    //       timeOut: 1500,
    //       positionClass: 'toast-top-right'
    //     });
    //   }

    // }
  
    loadProvinces() {
      this.ts.getProvincesWithDetails().subscribe(data => {
        this.provinces = data;
        this.amphures = data.flatMap(province => province.amphures);
        this.tambons = this.amphures.flatMap(amphure => amphure.tambons);
      });
    }
    getTambonName(id: number): string {
      // console.log('All Tambons:', this.tambons);
      // แปลง id เป็น number เพื่อให้ตรงกับข้อมูลใน array
      const tambonId = Number(id);
      // console.log("tambonId",tambonId)
      const tambon = this.tambons.find(t => t.id === tambonId);
      // console.log(`Searching for Tambon ID: ${tambonId}. Found:`, tambon);
      return tambon ? tambon.name_th : 'Not Found';
    } 
       // Method to get amphure name from id
       getAmphureName(id: number): string {
        // console.log('All Amphures:', this.amphures);
        // แปลง id เป็น number เพื่อให้ตรงกับข้อมูลใน array
        const amphureId = Number(id);
        const amphure = this.amphures.find(a => a.id === amphureId);
        // console.log(`Searching for Amphure ID: ${amphureId}. Found:`, amphure);
        return amphure ? amphure.name_th : 'Not Found';
      }

    getProvinceName(id: number): string {
      // ตรวจสอบประเภทของ id และแปลงให้ตรงกันถ้าจำเป็น
      const provinceId = Number(id);
      // ตรวจสอบข้อมูลใน provinces
      // console.log('All Provinces:', this.provinces);
      const province = this.provinces.find(p => p.id === provinceId);
      // console.log(`Searching for Province ID: ${provinceId}. Found:`, province);
      return province ? province.name_th : 'Not Found';
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
  
  openaddagency() {
    this.router.navigate(['/addagency']);
  }
  openAddAgencyModal(){
    $('#manageAgencyModel').modal({
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    $('#manageAgencyModel').modal('show');

  }
  // openEditAgencyModal(agencyId:any){
  //   this.sv.getOrganizationById(agencyId).subscribe(
  //     (agencyData) => {
  //       console.log('Fetched agency data:', agencyData); // ตรวจสอบข้อมูลที่ดึงมา
  //       this.agenForm.patchValue({
  //         _id: agencyData._id, 
  //         agency_name: agencyData?.agency_name,
  //         email: agencyData.email,
  //         phone: agencyData.phone,
  //         address: agencyData.address,
  //         province: agencyData.province,
  //         amphure: agencyData.amphure,
  //         tambon: agencyData.tambon,
  //         postCode: agencyData.postCode
  //       });
  //       $('#EditAgencyModel').modal({
  //         backdrop: 'static',
  //         keyboard: false
  //       });
  //       $('#EditAgencyModel').modal('show');
  //     },
  //     (error) => {
  //       console.error("Error fetching agency data", error);
  //     }
  //   );

  // }
  closeModal() {
    // ซ่อนโมดัล
    $('#manageAgencyModel').modal('hide');

    // รีเฟรชหน้าจอ
    this.refreshPage();
  }
  refreshPage() {
    window.location.reload();
  }

}
