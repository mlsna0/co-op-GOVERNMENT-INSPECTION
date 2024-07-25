import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharedService } from "../../services/shared.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  provinces: any[] = [];
  pdfButtonCount: number = 0;
  lastDataId: number = 0;

  constructor(private sv: SharedService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sv.pdfButtonCount$.subscribe(count => {
      this.pdfButtonCount = count;
      console.log('PDF Button Count:', this.pdfButtonCount);
      this.cdr.detectChanges(); // Trigger change detection
    });
    this.getDataCount();
  }

  getDataCount() {
    this.sv.getData().subscribe(data => {
      console.log('Data received from API:', data);
      if (data && data.records && data.records.length > 0) {
        // ใช้ record_id จาก data.records แทน
        const ids = data.records.map(item => Number(item.record_id));
        console.log('Record IDs from data:', ids);
        this.lastDataId = Math.max(...ids);
      } else {
        console.warn('No data received or records are empty');
      }
      console.log('Last Data ID:', this.lastDataId);
      this.cdr.detectChanges(); // Trigger change detection
    }, error => {
      console.error('Error fetching data count:', error);
    });
  }

  getDifference(): number {
    return this.lastDataId - this.pdfButtonCount;
  }
}
