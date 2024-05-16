import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'mongodb://localhost:27017/Angular-Project'; // URL ของ backend

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    console.log('Fetching items from:', `${this.apiUrl}/items`);
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }

  addItem(item: Item): Observable<Item> {
    console.log('Adding item to:', `${this.apiUrl}/items`, 'with data:', item);
    return this.http.post<Item>(`${this.apiUrl}/items`, item);
  }

  updateItem(item: Item): Observable<Item> {
    console.log('Updating item at:', `${this.apiUrl}/items/${item.id}`, 'with data:', item);
    return this.http.put<Item>(`${this.apiUrl}/items/${item.id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    console.log('Deleting item from:', `${this.apiUrl}/items/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }
}
