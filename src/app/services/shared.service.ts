import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SharedService {
 
  constructor(private http:HttpClient) { }

  getData(){
    return this.http.get(environment.GET_DATA) //GET_DATA api Backend
  }

  postData(data){
    return this.http.post(environment.POST_DATA, data)
  }
  searchData(SearchData){
    return this.http.get(environment.GET_DATA)

  }
  
  
}
