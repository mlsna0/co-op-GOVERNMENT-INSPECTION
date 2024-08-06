import { Component, OnInit,Input, OnChanges, SimpleChanges  } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
// import 'datatables.net';
// import 'datatables.net-dt/css/jquery.dataTables.css';
import * as $ from 'jquery';

interface Province {
  id: number;  // เพิ่มฟิลด์ id
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

  @Input() filterCriteria: any;
  provinces: Province[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: BehaviorSubject<any> = new BehaviorSubject([]); 
  loading: boolean = true;
  
  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      order: [[1, 'desc']],
      pagingType: 'simple_numbers',
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
      // console.log('Data from API:', data);
      this.provinces = data.map(province => ({
        id: province.id,  // เพิ่ม id ที่ได้รับจาก API
        name: province.name_th,
        count: Math.floor(Math.random() * 1000),
        percentage: parseFloat((Math.random() * 100).toFixed(2))
      }));
      // console.log('Provinces:', this.provinces);
      this.loading = false;
      this.dtTrigger.next(this.provinces);         
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterCriteria']) {
      console.log('FilterCriteria changed: ', changes['filterCriteria'].currentValue);
      if (this.filterCriteria) {
        this.applyFilter();
      }
    }
  }
  applyFilter() {
    if (this.filterCriteria) {
      console.log('Applying filter with criteria: ', this.filterCriteria);
      // โค้ดการกรองข้อมูลตาม this.filterCriteria
      this.filterProvinces();
    }
  }
  filterProvinces() {
    if (this.filterCriteria && this.filterCriteria.selectedProvinces) {
      const selectedIds = this.filterCriteria.selectedProvinces; // Get selected province IDs
  
      this.provinces = this.provinces.filter(province =>
        selectedIds.includes(province.id) // Check if province ID is in selected IDs
        
      );
      console.log('Filtered Provinces:', this.provinces);
  
      // Update DataTable with filtered data
      this.dtTrigger.next(this.provinces);
      // $(document).ready(() => {
      //   const table = $('#yourDataTableId').DataTable(); // Update this with your table ID
      //   table.clear(); // Clear existing data
      //   table.rows.add(this.provinces); // Add new data
      //   table.draw(); // Redraw the table
      // });
    }
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}