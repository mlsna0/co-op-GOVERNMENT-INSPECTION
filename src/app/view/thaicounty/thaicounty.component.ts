import { Component, OnInit } from '@angular/core';
import { ProvinceService } from '../../../app/view/thaicounty/thaicounty.service';
import { HttpClient } from '@angular/common/http';

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

  constructor(
    private provinceService: ProvinceService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.provinceService.getProvinces().subscribe(data => {
      console.log('Data from API:', data);  // เพิ่มบรรทัดนี้
      this.provinces = data.map(province => ({
        name: province.name_th,
        count: Math.floor(Math.random() * 1000),  // Example count
        percentage: parseFloat((Math.random() * 100).toFixed(2))  // Example percentage
      }));
      console.log('Provinces:', this.provinces);  // เพิ่มบรรทัดนี้
    });
  }
}
