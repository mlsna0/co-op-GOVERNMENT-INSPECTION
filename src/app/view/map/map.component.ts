import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map: L.Map;

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([13.736717, 100.523186], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Set bounds to Thailand
    const bounds: L.LatLngBoundsExpression = [
      [5.5, 97.5],  // Southwest coordinates of Thailand
      [20.5, 105.5] // Northeast coordinates of Thailand
    ];

    this.map.fitBounds(bounds);

    // Add circle markers for provinces
    const provinces = [
      { name: 'Chiang Mai', coords: [18.7883, 98.9853], content: 'Chiang Mai is known for its beautiful temples.' },
      { name: 'Phuket', coords: [7.8804, 98.3923], content: 'Phuket is famous for its beaches.' },
      { name: 'Khon Kaen', coords: [16.4419, 102.8359], content: 'Khon Kaen is a major city in Isan region.' },
      { name: 'Nakhon Ratchasima', coords: [14.9799, 102.0977], content: 'Nakhon Ratchasima is also known as Korat.' },
      { name: 'Ayutthaya', coords: [14.3532, 100.5684], content: 'Ayutthaya is known for its historical park.' },
      { name: 'Chon Buri', coords: [13.3611, 100.9847], content: 'Chon Buri is famous for its beaches and resorts.' },
      { name: 'Chiang Rai', coords: [19.9104, 99.8406], content: 'Chiang Rai is known for its mountain scenery.' },
      { name: 'Nakhon Si Thammarat', coords: [8.4324, 99.9631], content: 'Nakhon Si Thammarat is one of the oldest cities in Thailand.' },
      { name: 'Songkhla', coords: [7.1988, 100.5954], content: 'Songkhla is known for its unique blend of cultures.' },
      { name: 'Bangkok', coords: [13.7563, 100.5018], content: 'Bangkok is the capital of Thailand.' },
      { name: 'Lopburi', coords: [14.7994, 100.6480], content: 'Lopburi is known for its ancient ruins.' },
      { name: 'Sukhothai', coords: [17.0026, 99.8218], content: 'Sukhothai is the site of Thailand’s first kingdom.' },
      { name: 'Kanchanaburi', coords: [14.0244, 99.5331], content: 'Kanchanaburi is known for the Bridge over the River Kwai.' },
      { name: 'Trat', coords: [12.2397, 102.5157], content: 'Trat is famous for its islands and beaches.' },
      { name: 'Udon Thani', coords: [17.4156, 102.7859], content: 'Udon Thani is a major city in the Isan region.' },
      { name: 'Ubon Ratchathani', coords: [15.2490, 104.8557], content: 'Ubon Ratchathani is known for its temples and festivals.' },
      { name: 'Pattani', coords: [6.8754, 101.2958], content: 'Pattani is known for its unique culture and history.' },
      { name: 'Roi Et', coords: [16.0801, 103.6515], content: 'Roi Et is known for its historical and cultural sites.' },
      { name: 'Surat Thani', coords: [9.1391, 99.3214], content: 'Surat Thani is the gateway to Thailand’s southern islands.' },
      { name: 'Phetchaburi', coords: [12.9606, 99.9555], content: 'Phetchaburi is known for its historical sites and food.' },
      { name: 'Nakhon Pathom', coords: [13.8216, 100.0311], content: 'Nakhon Pathom is home to the world’s tallest stupa.' },
      { name: 'Chai Nat', coords: [15.1854, 100.1250], content: 'Chai Nat is known for its natural beauty and historical sites.' },
      { name: 'Lampang', coords: [18.2912, 99.5072], content: 'Lampang is famous for its horses and temples.' },
      { name: 'Prachuap Khiri Khan', coords: [11.7854, 99.7900], content: 'Prachuap Khiri Khan is known for its beautiful beaches.' },
      { name: 'Mae Hong Son', coords: [19.3036, 97.9630], content: 'Mae Hong Son is known for its mountainous landscapes.' },
      { name: 'Nakhon Nayok', coords: [14.1985, 101.2112], content: 'Nakhon Nayok is known for its waterfalls and natural beauty.' },
      { name: 'Prachin Buri', coords: [14.0577, 101.3884], content: 'Prachin Buri is known for its historical sites.' },
      { name: 'Sisaket', coords: [15.1142, 104.3280], content: 'Sisaket is known for its temples and natural beauty.' },
      { name: 'Yasothon', coords: [15.7735, 104.3390], content: 'Yasothon is known for its local festivals and culture.' },
      { name: 'Phitsanulok', coords: [16.8258, 100.2637], content: 'Phitsanulok is known for its historical significance.' },
      { name: 'Phrae', coords: [18.1511, 100.1645], content: 'Phrae is known for its historical temples and landscapes.' },
      { name: 'Saraburi', coords: [14.5324, 100.8037], content: 'Saraburi is known for its temples and historical sites.' },
      { name: 'Samut Prakan', coords: [13.5964, 100.6018], content: 'Samut Prakan is known for its historical and cultural attractions.' },
      { name: 'Samut Songkhram', coords: [13.4113, 99.9740], content: 'Samut Songkhram is known for its natural beauty and markets.' },
      { name: 'Suphan Buri', coords: [14.4709, 100.1250], content: 'Suphan Buri is known for its historical sites and cultural festivals.' },
      { name: 'Phatthalung', coords: [7.6165, 100.0554], content: 'Phatthalung is known for its natural beauty and culture.' },
      { name: 'Buri Ram', coords: [15.0215, 103.1233], content: 'Buri Ram is known for its ancient Khmer ruins.' },
      { name: 'Chaiyaphum', coords: [15.7956, 102.0283], content: 'Chaiyaphum is known for its natural beauty and festivals.' },
      { name: 'Rayong', coords: [12.6825, 101.2754], content: 'Rayong is famous for its beaches and fruits.' },
      { name: 'Nakhon Sawan', coords: [15.7088, 100.1372], content: 'Nakhon Sawan is known as the "Gateway to the North".' },
      { name: 'Sakon Nakhon', coords: [17.1673, 104.1492], content: 'Sakon Nakhon is known for its temples and natural attractions.' },
      { name: 'Mukdahan', coords: [16.5453, 104.7239], content: 'Mukdahan is known for its beautiful landscapes and cultural diversity.' },
      { name: 'Nan', coords: [18.7824, 100.7811], content: 'Nan is known for its beautiful natural scenery and temples.' },
      { name: 'Nonthaburi', coords: [13.8591, 100.5217], content: 'Nonthaburi is known for its proximity to Bangkok and its cultural sites.' },
      { name: 'Sa Kaeo', coords: [13.8140, 102.0721], content: 'Sa Kaeo is known for its border market and natural beauty.' },
      { name: 'Chachoengsao', coords: [13.6904, 101.0772], content: 'Chachoengsao is known for its temples and rivers.' },
      { name: 'Phetchabun', coords: [16.4201, 101.1606], content: 'Phetchabun is known for its mountains and national parks.' },
      { name: 'Amnat Charoen', coords: [15.8582, 104.6270], content: 'Amnat Charoen is known for its cultural heritage and festivals.' },
      { name: 'Chanthaburi', coords: [12.6113, 102.1041], content: 'Chanthaburi is known for its gemstones and fruit orchards.' },
      { name: 'Nong Bua Lamphu', coords: [17.2046, 102.4407], content: 'Nong Bua Lamphu is known for its natural beauty and history.' },
      { name: 'Nong Khai', coords: [17.8783, 102.7427], content: 'Nong Khai is known for its proximity to the Mekong River.' },
      { name: 'Satun', coords: [6.6238, 100.0674], content: 'Satun is known for its beautiful islands and marine life.' },
      { name: 'Narathiwat', coords: [6.4264, 101.8239], content: 'Narathiwat is known for its cultural diversity and natural beauty.' },
      { name: 'Yala', coords: [6.5421, 101.2800], content: 'Yala is known for its cultural heritage and beautiful landscapes.' },
      { name: 'Ranong', coords: [9.9659, 98.6348], content: 'Ranong is known for its hot springs and natural beauty.' },
      { name: 'Tak', coords: [16.8836, 99.1255], content: 'Tak is known for its beautiful mountains and waterfalls.' },
      { name: 'Phang Nga', coords: [8.4510, 98.5220], content: 'Phang Nga is known for its bay and limestone islands.' },
      { name: 'Krabi', coords: [8.0863, 98.9063], content: 'Krabi is known for its stunning beaches and islands.' },
      { name: 'Kalasin', coords: [16.4322, 103.5061], content: 'Kalasin is known for its cultural heritage and natural beauty.' },
      { name: 'Nakhon Phanom', coords: [17.3998, 104.7922], content: 'Nakhon Phanom is known for its temples and scenic beauty.' },
      { name: 'Lamphun', coords: [18.5740, 99.0087], content: 'Lamphun is known for its historical sites and temples.' },
      { name: 'Phayao', coords: [19.1938, 99.8780], content: 'Phayao is known for its beautiful lake and cultural heritage.' },
      { name: 'Ratchaburi', coords: [13.5362, 99.8111], content: 'Ratchaburi is known for its cultural heritage and natural beauty.' },
      { name: 'Phichit', coords: [16.4477, 100.3496], content: 'Phichit is known for its historical significance and temples.' },
      { name: 'Ang Thong', coords: [14.5896, 100.4553], content: 'Ang Thong is known for its cultural heritage and temples.' }
    ];

    provinces.forEach(province => {
      L.circleMarker(L.latLng(province.coords as [number, number]), {
        radius: 2.5,  // ลดขนาดลงครึ่งหนึ่ง
        color: '#000',  // เปลี่ยนเป็นสีดำ
        fillColor: '#000',  // เปลี่ยนเป็นสีดำ
        fillOpacity: 0.5
      })
        .bindPopup(`<b>${province.name}</b><br>${province.content}`)
        .addTo(this.map);
    });
    
  }
}
