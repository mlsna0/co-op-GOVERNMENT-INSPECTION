import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginservice } from 'app/layouts/login.services.';
import { Router } from '@angular/router';
import { SharedService } from 'app/services/shared.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manageuser',
  templateUrl: './manageuser.component.html',
  styleUrls: ['./manageuser.component.css']
})
export class ManageuserComponent implements OnInit {

  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string; // เพิ่มบรรทัดนี้
  phone: string;
  regisForm: any;
  Submitted: boolean = false;
  organization: any[] = [];
  availableOrganizations: any[] = []; // ตัวแปรใหม่สำหรับเก็บ organization ที่ยังไม่ถูกเลือก
  selectedOrganization: string = ''; // เพิ่มตัวแปรใหม่เพื่อเก็บค่า organization ที่เลือก
  usedOrganizations: any; // เพิ่มตัวแปรใหม่เพื่อเก็บค่าข้อมูลผู้ใช้
  users: any[] = []; // ประกาศตัวแปร users เป็น array


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


  user: any[] = [];
  dtOptions: any = {}; // datatable.setting = {}
  dtTrigger: Subject<any> = new Subject();
  loading: boolean = true;
  error: string = '';
  exportCounter: any;


  PasswordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password'

  constructor(
    private http: HttpClient,
    private ls: loginservice,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private sv: SharedService,
    private router: Router,
    private fb: FormBuilder,
    private ts: ProvinceService,
    private toastr: ToastrService
  ) {
    this.regisForm = this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmpassword: ["", [Validators.required, Validators.minLength(8)]],
      organization: ['', Validators.required],
      bearing: ['', Validators.required],
      address: ["", Validators.required],
      phone: ["", [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      province: ['', Validators.required],
      amphure: ['', Validators.required],
      tambon: ['', Validators.required],
      postCode: ['', Validators.required],
      role: ['admin'],
      profileImage: ['']
    }, { validator: this.passwordMatchValidator });

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
    this.ls.getUserReport().subscribe(data => {
      this.user = this.mergeUserData(data.employees, data.users);
      // console.log("data : ",data)
      // console.log("data employees : ",data.employees)
      // console.log("data user : ",data.users)

      this.user = this.user.filter(user => user?.role === 'admin'); // กรองเฉพาะที่ role เป็น 'admin'
      //console.log("status: ", this.user);
      console.log("status: ", this.user)
      this.loading = false;
    }, error => {
      console.error('Error fetching user data:', error);
      this.loading = false;
    });
    this.loadProvinces();
    this.loadOrganizations();
  }

  mergeUserData(registerData: any[], userData: any[]): any[] {
    return registerData.map(regUser => {
      const user = userData.find(u => u.employeeId === regUser._id); // ตรวจสอบให้แน่ใจว่าใช้ key ที่ถูกต้อง
      return {
        id: user ? user._id : null, // ใช้ ID ของ `user` แทน `employee`
        firstname: regUser.firstname,
        lastname: regUser.lastname,
        email: regUser.email,
        organization: regUser.organization,
        role: user ? user.role : 'N/A', // หากไม่พบข้อมูล role
        isActive: user ? user.isActive : false
      };
    });
  }

  // getUserReportProfile(id: any) {
  //   this.router.navigate([`/profileuser/${id}`]).catch(err => {
  //     console.error('Navigation Error:', err);
  //   });
  //   console.log('id',id)
  // }

  getUserReportProfile(userId: any) {
    this.router.navigate(['/profileuser', userId]);
  }
  openAgencyMember(UserID) {
    console.log("User ID of next page: ", UserID)
    this.router.navigate(['/agency-member', UserID]);
  }




  onRoleChange(user: any) {
    console.log('User ID:', user.id); // เพิ่มบรรทัดนี้เพื่อตรวจสอบค่า user.id
    if (user.id) { // ตรวจสอบว่ามี user.id ก่อนทำการอัปเดต
      this.ls.updateUserRole(user.id, user.role).subscribe(
        (response) => {
          console.log('Role updated successfully:', response);
          // Optionally show a success message to the user
        },
        (error) => {
          console.error('Error updating role:', error);
          // Optionally show an error message to the user
        }
      );
    } else {
      console.error('User ID is missing');
      // Optionally show an error message to the user
    }
  }

  updateUserStatus(user: any) {
    console.log('User ID status:', user.id);
    console.log('user.isActive status:', user.isActive);

    if (user.id) {
      this.sv.updateUserStatus(user.id, user.isActive).subscribe(
        response => {
          console.log('Status updated successfully:', response);

          // ดึงข้อมูลผู้ใช้ทั้งหมดใน agency เดียวกัน
          this.sv.getPersonsWithSameOrganization(response.agencyId).subscribe(
            (usersInAgency: any[]) => {
              // console.log("same agency: ",usersInAgency)
      
              let otherAdminUpdated = false;

              usersInAgency.forEach(userInAgency => {
                // console.log("Before change - userInAgency isActive: ", userInAgency.isActive);  // เช็คสถานะก่อน
                if (userInAgency.role === 'admin' && userInAgency._id !== user._id) {
                  // console.log("Checking admin with ID: ", userInAgency._id);
                  if (userInAgency.isActive) {
                    // console.log("userInAgency isActive is true, changing to false...");
                    userInAgency.isActive = false;  // ปิดสถานะของ admin คนอื่น
                  
                  }
                }
                otherAdminUpdated =  userInAgency.isActive;
                // console.log("After change - userInAgency isActive: ", userInAgency.isActive);  // เช็คสถานะหลัง
              });
                 // บังคับให้ UI อัปเดต
           // อัปเดตตัวแปร users
          //  this.users = usersInAgency;
          //  console.log("this users: ", this.users);

          //  // บังคับให้ Angular อัปเดต UI
          //  this.cdr.detectChanges();

           // ถ้ามีการอัปเดต admin คนอื่น จะรีเฟรชหน้าเว็บ
           if (otherAdminUpdated) {
            this.cdr.detectChanges();
             window.location.reload();
            // console.log("on  window.location.reload();")
           }
            
            },
            err => {
              console.error('Error fetching users in agency:', err);
            }
          );

        },
        error => {
          console.error('Error updating user status:', error);
        }
      );
    }
}
  // updateUserStatus(user: any) {
  //   console.log('User ID status:', user.id);
  //   console.log('user.isActive status:', user.isActive);

  //   if (user.id) {
  //     this.sv.updateUserStatus(user.id, user.isActive).subscribe(
  //       response => {
  //         console.log('Status updated successfully:', response);
      
  //         this.cdr.detectChanges();
  //       },
  //       error => {
  //         console.error('Error udating user status:', error);
  //       }
  //     );
  //   }
  // }



    
  //toggle eyes 
  togglePasswordVisibility(field: string): void {
    if (field === 'Password') {
      this.PasswordFieldType = this.PasswordFieldType === 'password' ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
      this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }

  exportToExcel(): void {
    // กำหนดข้อมูลตามลำดับคอลัมน์ที่ต้องการ
    const exportData = this.user.map((users, index) => ({
      'ลำดับ': index + 1,
      'ชื่อ': users.firstname,
      'นามสกุล': users.lastname,
      'อีเมล': users.email,
      'ระดับผู้ใช้งาน': users.role,
      'สถานะผู้ใช้งาน': users.isActive ? 'Active' : 'Inactive',
    }));

    // สร้างแผ่นงาน (worksheet) จากข้อมูลที่จัดเรียงแล้ว
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // สร้างหนังสือ (workbook) ใหม่
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ReportUser');

    // สร้างไฟล์ Excel
    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const fileName = `UserReport${this.exportCounter}.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

    // เพิ่มตัวนับ
    this.exportCounter++;
  }

  //เพิ่มข้อมูลผู้ใช้งาน
  onSubmit(data) {
    const organizationValue = this.regisForm.get('organization')?.value;
    if (!organizationValue) {
      console.error('Organization value is required');
      return;
    }
    console.log('Organization value:', organizationValue);
    this.updateAgencyStatus(organizationValue);

    this.selectedOrganization = organizationValue;

    this.Submitted = true;
    if (this.regisForm.invalid) {
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

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    const formData = new FormData();
    Object.keys(this.regisForm.controls).forEach(key => {
      formData.append(key, this.regisForm.get(key)?.value);
    });
    if (file) {
      formData.append('profileImage', file);
    }

    this.ls.register(formData).subscribe(
      (response) => {
        this.toastr.success('ลงทะเบียนสำเร็จ', 'สำเร็จ!', {
          timeOut: 1500,
          positionClass: 'toast-top-right'
        }).onHidden.subscribe(() => {
          // this.filterAvailableOrganizations(); // Refresh the organizations
          this.closeModal(); // Close the modal
        });
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
    });
  }


  loadOrganizations(): void {
    this.ls.getagency().subscribe(
      (data: any) => {
        this.organization = data;
        console.log('All organizations:', this.organization);
        this.filterAvailableOrganizations(); // Apply the filter here
      },
      (error) => console.error('Error loading organizations:', error)
    );
  }

  // filterAvailableOrganizations(): void {
  //   this.ls.getuserregister().subscribe(
  //     (usedOrganizations: any[]) => {
  //       console.log('Used organizations:', usedOrganizations); // Log used organizations
  //       console.log('All organizations before filtering:', this.organization); // Log before filtering
  //       this.availableOrganizations = this.organization.filter(org =>
  //         // !usedOrganizations.some(usedOrg => usedOrg.organization  === org.agency_name)
  //         !usedOrganizations.some(usedOrg => usedOrg.agencies  === org._id)
  //       );
  //       console.log('Available organizations:', this.availableOrganizations);
  //     },
  //     (error) => console.error('Error loading used organizations:', error)
  //   );
  // }
  filterAvailableOrganizations(): void {
    // Get all users
    this.ls.getUsers().subscribe(
      (users: any[]) => {
        console.log('All users:', users); // Log users

        // Get all used organizations from user registrations
        this.ls.getuserregister().subscribe(
          (usedOrganizations: any[]) => {
            console.log('Used organizations:', this.usedOrganizations); // Log used organizations
            console.log('All organizations before filtering:', this.organization); // Log all organizations before filtering
            this.usedOrganizations = usedOrganizations;
            // Filter organizations ที่มี admin ใช้งานแล้ว โดยเช็คว่าองค์กรนั้นถูกใช้โดยผู้ใช้ที่ role ไม่ใช่ "user" และมี isActive เป็น true
            this.availableOrganizations = this.organization.filter(org => {
              // หาผู้ใช้ที่มีบทบาทไม่ใช่ "user" และมีสถานะเป็น active สำหรับ agency นี้
              const usedNonUserForAgency = usedOrganizations.find(usedOrg =>
                usedOrg.agencies === org._id && users.find(user =>
                  user.employeeId === usedOrg._id && user.role !== 'user' && user.isActive
                )
              );

              // Log user ที่ใช้หน่วยงานนี้
              if (usedNonUserForAgency) {
                console.log(`Found active non-user role for organization ${org._id}:`, usedNonUserForAgency);
              }

              // Return true ถ้าไม่มีผู้ใช้ที่มีบทบาทที่ไม่ใช่ user และ isActive ใช้ agency นี้
              return !usedNonUserForAgency;
            });

            console.log('Available organizations after filtering:', this.availableOrganizations);
          },
          (error) => console.error('Error loading used organizations:', error)
        );
      },
      (error) => console.error('Error loading users:', error)
    );
  }
  updateAgencyStatus(agencyId) {

    console.log("form Id to update: ", agencyId)
    const updateData = { isActive: false };
    // ตรวจสอบว่ามี ID หรือไม่
    if (agencyId) {
      this.sv.UpdateOrganizationById(agencyId, updateData).subscribe(
        (response) => {
          console.log("Agency updated successfully", response);
          // this.toastr.success('อัปเดตข้อมูลสำเร็จ', 'สำเร็จ', {
          //   timeOut: 1500,
          //   positionClass: 'toast-top-right'
          // }).onHidden.subscribe(() => {
          // //  window.location.reload();  // รีเฟรชหน้าจอหลังจากแจ้งเตือนหายไป
          // });
        },
        (error) => {
          console.error("Error updating agency", error);
          this.toastr.error('การอัปเดตสถานะหน่วยงานไม่สำเร็จ', 'เกิดข้อผิดพลาด!', {
            timeOut: 1500,
            positionClass: 'toast-top-right'
          });
        }
      );
    } else {
      this.toastr.error('ไม่พบข้อมูลสำหรับการอัปเดต', 'เกิดข้อผิดพลาด!', {
        timeOut: 1500,
        positionClass: 'toast-top-right'
      });
    }

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

  openaddperson() {
    this.router.navigate(['/addperson']);
  }
  openAddPersonModal() {
    this.filterAvailableOrganizations(); // Ensure the dropdown is refreshed
    $('#manageUserModel').modal({
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    $('#manageUserModel').modal('show');

  }
  closeModal() {
    // ซ่อนโมดัล
    $('#manageUserModel').modal('hide');

    // รีเฟรชหน้าจอ
    this.refreshPage();
  }
  refreshPage() {
    this.loadOrganizations(); // Reload organizations to refresh the list
    this.filterAvailableOrganizations(); // Apply the filter again
    window.location.reload();
  }
}
