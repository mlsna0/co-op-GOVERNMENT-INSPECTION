import { Component, OnInit } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  chartOptions = {
	  animationEnabled: false,
	  theme: "white",
	  title:{
		// text: "Social Media Engagement"
	  },
	  data: [{
		type: "pie",
		startAngle: 45,
		indexLabel: "{name}: {y}",
		indexLabelPlacement: "inside",
		yValueFormatString: "#,###.##'%'",
		dataPoints: [
		  { y: 21.3, name: "Facebook" },
		  { y: 27.7, name: "Instagram" },
		  
		]
	  }],
    legend: {
      verticalAlign: "bottom", // ตำแหน่งของ legend อยู่ด้านล่าง
      horizontalAlign: "center", // จัดแนว legend ให้อยู่ตรงกลาง
      fontSize: 16, // ขนาดของฟอนต์ใน legend
      fontFamily: "Sarabun', sans-serif" // ชนิดของฟอนต์ใน legend
    },
    toolTip: {
      content: "{name}: {y}" // เนื้อหาที่จะแสดงใน tooltip
    }
	}
	
  provinces: any[] = [];

  constructor(
  
  ) { }

  ngOnInit(): void {
    
  }

}




// import { Component, OnInit, ViewChild  } from '@angular/core';
// import { ChartComponent } from "ng-apexcharts";
// import {
//   ApexNonAxisChartSeries,
//   ApexResponsive,
//   ApexChart
// } from "ng-apexcharts";

// export type ChartOptions = {
//   series: ApexNonAxisChartSeries;
//   chart: ApexChart;
//   responsive: ApexResponsive[];
//   labels: any;
// };

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent implements OnInit {

//   @ViewChild("chart") chart: ChartComponent;
//   public chartOptions: Partial<ChartOptions>;
 
//   provinces: any[] = [];

//   constructor(
  
//   ) { 

//     this.chartOptions = {
//       series: [44, 55, 13, 43, 22],
//       chart: {
//         width: 380,
//         type: "pie"
//       },
//       labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
//       responsive: [
//         {
//           breakpoint: 480,
//           options: {
//             chart: {
//               width: 200
//             },
//             legend: {
//               position: "bottom"
//             }
//           }
//         }
//       ]
//     };
    
//   }

//   ngOnInit(): void {
    
//   }

// }

