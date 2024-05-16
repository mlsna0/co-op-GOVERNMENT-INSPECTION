import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DataService } from './service/data.service';
import { BrowserModule } from '@angular/platform-browser';
 // นำเข้า AdminLayoutModule แทนที่จะประกาศ component ที่นี่

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    BrowserModule,
    
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
