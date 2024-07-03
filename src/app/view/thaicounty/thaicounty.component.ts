import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

interface Province {
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-thaicounty',
  templateUrl: './thaicounty.component.html',
  styleUrls: ['./thaicounty.component.css']
})
export class ThaicountyComponent implements OnInit {

  provinces: Province[] = [];
  dtOptions: any = {}; //datatable settings
  dtTrigger: BehaviorSubject<any> = new BehaviorSubject([]); 
  loading: boolean = true;
  
  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[1, 'desc']],
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

    this.provinceService.getProvinces().subscribe(data => {
      console.log('Data from API:', data);
      this.provinces = data.map(province => ({
        name: province.name_th,
        count: Math.floor(Math.random() * 1000),
        percentage: parseFloat((Math.random() * 100).toFixed(2))
      }));
      console.log('Provinces:', this.provinces);
      this.loading = false;
      this.dtTrigger.next(this.provinces);
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}