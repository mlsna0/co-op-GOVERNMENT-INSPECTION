import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chartData = new BehaviorSubject<any[]>([]); // ใช้ BehaviorSubject เพื่อจัดการกับข้อมูลกราฟ
  chartData$ = this.chartData.asObservable(); // แปลงเป็น Observable เพื่อให้คอมโพเนนต์อื่นสามารถสมัครติดตามได้

  updateChartData(data: any[]): void {
    this.chartData.next(data); // อัพเดทข้อมูลกราฟ
  }
}
