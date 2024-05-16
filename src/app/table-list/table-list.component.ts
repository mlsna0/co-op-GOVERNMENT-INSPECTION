import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { Item } from '../models/item.model';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  data: Item[] = [];
  showPopup = false;
  isEdit = false;
  formData: Item = {
    id: null,
    name: '',
    country: '',
    city: '',
    salary: null
  };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataService.getItems().subscribe(
      (items: Item[]) => {
        console.log('Data loaded:', items); // เพิ่ม console.log ตรงนี้เพื่อดูข้อมูลที่โหลดมา
        this.data = items;
      },
      error => {
        console.error('Error loading data', error);
      }
    );
  }

  openAddPopup() {
    this.isEdit = false;
    this.formData = {
      id: null,
      name: '',
      country: '',
      city: '',
      salary: null
    };
    console.log('Opening add popup with formData:', this.formData); // ดูข้อมูลตอนเปิด popup เพิ่ม
    this.showPopup = true;
  }

  openEditPopup(item: Item) {
    this.isEdit = true;
    this.formData = { ...item };
    console.log('Opening edit popup with formData:', this.formData); // ดูข้อมูลตอนเปิด popup แก้ไข
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    console.log('Popup closed'); // เพิ่ม console.log เพื่อเช็คเมื่อ popup ถูกปิด
  }

  submitForm() {
    if (this.isEdit) {
      console.log('Submitting form for edit with formData:', this.formData); // ดูข้อมูลก่อนที่จะส่งข้อมูลอัพเดต
      this.dataService.updateItem(this.formData).subscribe(
        (updatedItem: Item) => {
          console.log('Item updated:', updatedItem); // ดูข้อมูลหลังจากอัพเดต
          const index = this.data.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            this.data[index] = updatedItem;
          }
          this.closePopup();
        },
        error => {
          console.error('Error updating item', error);
        }
      );
    } else {
      console.log('Submitting form for add with formData:', this.formData); // ดูข้อมูลก่อนที่จะส่งข้อมูลเพิ่มใหม่
      this.dataService.addItem(this.formData).subscribe(
        (newItem: Item) => {
          console.log('Item added:', newItem); // ดูข้อมูลหลังจากเพิ่มใหม่
          this.data.push(newItem);
          this.closePopup();
        },
        error => {
          console.error('Error adding item', error);
        }
      );
    }
  }
  
}
