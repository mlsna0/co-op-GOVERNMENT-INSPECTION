import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { SharedService } from 'app/services/shared.service';
import { loginservice } from 'app/layouts/login.services.';
import { ProvinceService } from '../../../../app/view/thaicounty/thaicounty.service';
import { ToastrService } from 'ngx-toastr';
import { response } from 'express';

@Component({
  selector: 'app-agency-member',
  templateUrl: './agency-member.component.html',
  styleUrls: ['./agency-member.component.css']
})
export class AgencyMemberComponent implements OnInit {
  loading:boolean = false; //for laoding data and stop loading
  dtOptions: any ={};

  UserID: any; //get ID from manage User 
  OrganizationID:any;
  selectedOrganizationID:any;

  dataPerson: any[] = [];
  UserData:any ={};
  UserDataReport:any ={};
  DataOrganization:any ={};

  regisForm: any;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string; // เพิ่มบรรทัดนี้
  phone: string;

  Submitted:boolean=false;
  organization: any[] = [];

    
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

  
  PasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password'
  constructor(
    private router: Router,
    private ACrouter :ActivatedRoute,
    private sv: SharedService, 
    private loginSV:loginservice,
    private ts: ProvinceService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { 
    this.regisForm = this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["",[Validators.required, Validators.minLength(8)]],
      confirmpassword: ["", [Validators.required, Validators.minLength(8)]],
      organization:['', Validators.required],
      bearing:['', Validators.required],
      address:["", Validators.required],
      phone: ["", [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      province: ['', Validators.required],
      amphure: ['', Validators.required],
      tambon: ['', Validators.required],
      postCode: ['', Validators.required],
      role: ['user'],
      profileImage: ['']
    } ,{ validator: this.passwordMatchValidator });

  }

  ngOnInit(): void {
    this.loading = true;
    this.dtOptions = {
      order: [0,'asc'], // 'desc' มากไปน้อย  'asc' น้อยไปมาก
      pagingType: 'full_numbers',
      language: {
        lengthMenu: "แสดง _MENU_ รายการ",
        search: "ค้นหา",
        info: "แสดงหน้า _PAGE_ จากทั้งหมด _PAGES_ หน้า",
        infoEmpty: "แสดง 0 ของ 0 รายการ",
        zeroRecords: "ไม่พบข้อมูล",
        paginate: {
          first: "หน้าแรก",
          last: "หน้าสุดท้าย",
          next: "ต่อไป",
          previous: "ย้อนกลับ"
        },
      }
    };



    //ใช้รับค่าจาก หน้า manageUser
    this.ACrouter.paramMap.subscribe(params => {
      this.UserID = params.get('id');

      // ทำงานอื่น ๆ ที่คุณต้องการใช้กับ itemId นี้
      console.log("UserID it send? >",this.UserID); // ทดสอบการดึงค่า id
      // this.loading =false;
  
    });

    this.sv.getUserProfileById(this.UserID).subscribe(res=>{
      this.UserData =res;

      console.log("user data : ",this.UserData)
      this.OrganizationID = this.UserData?.employeeId?.agencies;
      this.selectedOrganizationID = this.OrganizationID; 
      // console.log("this.selectedOrganizationID : ",this.selectedOrganizationID)

      this.sv.getOrganizationById(this.selectedOrganizationID).subscribe(res=>{
        this.DataOrganization = res;
        this.OrganizationID = this.DataOrganization?._id
      //  console.log("ID agency : ",this.OrganizationID)

        // console.log("Data of Organiz: ",this.DataOrganization)
        this.regisForm.patchValue({
          organization: this.DataOrganization?._id
        });
    //    this.loading = false; // เมื่อข้อมูลถูกโหลดแล้ว ให้สถานะเป็น false
      });
      this.sv.getPersonsWithSameOrganization(this.selectedOrganizationID).subscribe(res => {
        this.dataPerson = res;
        // this.dataPerson = res.map(person => ({
        //   ...person,
        //   isActive: person.isActive !== undefined ? person.isActive : false
        // }));
        this.dataPerson = this.dataPerson.filter(dataPerson => dataPerson.role === 'user'); // กรองเฉพาะที่ role เป็น 'user'
        // console.log("status: ", this.dataPerson);
     
        // แสดงผลลัพธ์เพื่อทดสอบ
        //  this.dataPerson.forEach(person => {
        //    console.log("User ID:", person._id);
        //   console.log("isActive:", person.isActive);
        // });
    
      
        console.log("Data of person:", this.dataPerson);
        this.loading = false; // เมื่อข้อมูลถูกโหลดแล้ว ให้สถานะเป็น false
      }, error => {
        this.loading = false; // ในกรณีเกิดข้อผิดพลาด ให้ทำสถานะเป็น false ด้วย
        console.error('Error fetching persons:', error);
      
      });
      
      
    })

    this.loadProvinces(); 
    // this.loadOrganizations();

  }

  
  getUserReportProfile(userId: any) {
    this.router.navigate(['/profileuser', userId]);
  }
  


// toggle status 
// ฟังก์ชันเพื่อ toggle status และอัปเดตข้อมูลไปยัง backend
updateUserStatus(person: any) {
  // ตรวจสอบข้อมูลก่อนการอัปเดต
  console.log('User ID:', person?._id); 
  console.log('User isActive status:', person.isActive);

  // ตรวจสอบว่ามี user id และ isActive เพื่ออัปเดตสถานะ
  if (person?._id && person.isActive !== undefined) {
    this.sv.updateUserStatus(person?._id, person.isActive).subscribe(response => {
      console.log('Status updated successfully:', response);
    }, error => {
      console.error('Error updating status:', error);
    });
  }
}

//toggle eyes 
togglePasswordVisibility(field: string): void {
  if (field === 'Password') {
      this.PasswordFieldType = this.PasswordFieldType === 'password' ? 'text' : 'password';
  } else if (field === 'confirmPassword') {
      this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
  }
}

//match password formGrop
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmpassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mustMatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  loadProvinces() {
    this.ts.getProvincesWithDetails().subscribe(data => {
      this.provinces = data;
      // console.log("getProvincesWithDetails : ",this.provinces)
     // this.loading = false
    });
  }


  onProvinceChange(provinceId: number) {
    this.regisForm.controls['amphure'].setValue('');
    this.regisForm.controls['tambon'].setValue('');
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
    this.regisForm.controls['tambon'].setValue('');

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


// modal open and close
  openAddPersonModal(){
    $('#memberModel').modal({
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    $('#memberModel').modal('show');

  }

  closeModal() {
    // ซ่อนโมดัล
    $('#memberModel').modal('hide');

    // รีเฟรชหน้าจอ
    this.refreshPage();
  }
  refreshPage() {
    window.location.reload();
  }





  //for put to database
  onSubmit(data) {
   
      
    this.Submitted = true; 
    if (this.regisForm.invalid) {
      console.log(this.regisForm)
      this.toastr.error('กรุณากรอกข้อมูลทุกช่อง', 'เกิดข้อผิดพลาด!', {
        timeOut: 1500,
        positionClass: 'toast-top-right'
      });
      if (this.regisForm.controls.password.errors?.minlength || this.regisForm.controls.confirmpassword.errors?.minlength) {
        this.toastr.error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'เกิดข้อผิดพลาด!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
        });
      }
      return;
    }
  
    if (this.regisForm.value.password !== this.regisForm.value.confirmpassword) {
      this.toastr.error('รหัสผ่านไม่ตรงกัน', 'เกิดข้อผิดพลาด!', {
        timeOut: 1500,
        positionClass: 'toast-top-right'
      });

      return;
    }
    console.log("formData : ",data)
    if (!this.regisForm.value.organization) {
      this.toastr.error('กรุณากรอกข้อมูลหน่วยงาน', 'เกิดข้อผิดพลาด!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
      });
      return;
  }
  
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    console.log(fileInput);
    
    const file = fileInput?.files?.[0]; // Get the file from the input
  
    const formData = new FormData();
    Object.keys(this.regisForm.controls).forEach(key => {
      formData.append(key, this.regisForm.get(key)?.value);
    });
    if (file) {
      formData.append('profileImage', file);
    }
  
    this.loginSV.register(formData).subscribe(
      (response) => {
        console.log("formData to insert: ",response);

        this.toastr.success('ลงทะเบียนสำเร็จ', 'สำเร็จ!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
        }).onHidden.subscribe(() => {
          window.location.reload();  // รีเฟรชหน้าจอหลังจากแจ้งเตือนหายไป
        });
        
        this.closeModal();
     
      },
      (error) => {
        console.error('Error submitting data:', error);
        this.toastr.error('การเพิ่มข้อมูลไม่สำเร็จ', 'เกิดข้อผิดพลาด!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
        });
      
      } 
    );

  }



}
