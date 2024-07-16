import { Component, OnInit } from "@angular/core";
import { CanvasJSAngularChartsModule } from "@canvasjs/angular-charts";
import { ProvinceService } from "../thaicounty/thaicounty.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  provinces: { name: string }[] = []; // เปลี่ยนเป็น provinces
  selectedProvince: string;
  // provinces: any[] = [];

  constructor(private provinceService: ProvinceService) {}

  ngOnInit(): void {
    this.loadProvinces();
  }

  loadProvinces(): void {
    this.provinceService.getProvinces().subscribe(
      (data) => {
        console.log("Data from API:", data);
        this.provinces = data.map((province) => ({ name: province.name_th }));
        console.log("Provinces:", this.provinces);
      },
      (error) => {
        console.error("Error fetching provinces:", error);
      }
    );
  }

  onProvinceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProvince = target.value;

    // ตรวจสอบการเลือก "เลือกทั้งหมด"
    if (this.selectedProvince === "") {
      console.log("เลือกทั้งหมด");
    } else {
      const selectedProvinceData = this.provinces.find(
        (province) => province.name === this.selectedProvince
      );
      console.log("Selected Province:", selectedProvinceData);
    }
  }
}
