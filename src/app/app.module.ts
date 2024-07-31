import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TableListComponent } from './table-list/table-list.component';
import { SharedService } from "./services/shared.service";
import { GeocodingServiceService } from './services/geocodingService/geocoding-service.service';
// import { DataTablesModule } from "angular-datatables"; //ลองทำตามที่ chatบอก ไม่ work
// import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
// import { PdfViewerModule } from 'ng2-pdf-viewer'; 
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgxLoadingModule } from 'ngx-loading';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SignatureComponent } from './signature/signature.component';
import { HistoryComponent } from './view/history/history.component';
import { TokenInterceptor } from './layouts/auth-layout/token.interceptor';
import { NgApexchartsModule } from "ng-apexcharts";





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
    // NgxExtendedPdfViewerModule
    NgxExtendedPdfViewerModule,
    SignaturePadModule,
    DragDropModule,
    PdfViewerModule,
    NgxLoadingModule.forRoot({}),
    NgApexchartsModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    SignatureComponent,
    HistoryComponent,

  ],
  providers: [SharedService,
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
 
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Optional, only if you face schema issues
  
})
export class AppModule { }
