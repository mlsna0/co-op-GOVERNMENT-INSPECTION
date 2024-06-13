import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TableListComponent } from './table-list/table-list.component';
import { SharedService } from "./services/shared.service";
import { GeocodingServiceService } from './services/geocodingService/geocoding-service.service';
// import { DataTablesModule } from "angular-datatables"; //ลองทำตามที่ chatบอก ไม่ work
@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    // DataTablesModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    

  ],
  providers: [SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
