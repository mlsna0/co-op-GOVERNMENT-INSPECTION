import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
// import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
// import { SignatureComponent } from '../../signature/signature.component';
import { EmployeeComponent } from '../../employee/employee.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatRippleModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import { DashboardComponent } from 'app/view/dashboard/dashboard.component';
import { ThaicountyComponent } from '../../view/thaicounty/thaicounty.component';
import { ProfileComponent } from '../../view/profile/profile.component';
import { MapComponent } from '../../view/map/map.component';
import { DataTablesModule } from "angular-datatables"; //petch เพิ่ม datatables เพื่อใช้ใน tablelist
import { ThaiDatePipe } from "./../../services/pipe/thaidate.service";
import { GeocodingServiceService } from './../../services/geocodingService/geocoding-service.service';
import { MatCardModule } from '@angular/material/card'; //petch add
import { MatIconModule } from '@angular/material/icon'; //petch add
import { TableDetailComponent } from 'app/view/table-detail/table-detail.component';
import {TableMainComponent } from '../../view/table-main/table-main.component';
import {DataDetailComponent } from '../../view/table-main/data-detail/data-detail.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ReportuserComponent } from 'app/view/reportuser/reportuser.component';

import { ReportuserbuildComponent } from '../../view/reportuser/reportuserbuild/reportuserbuild.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { AppComponent } from 'app/app.component';
import { ManageuserComponent } from '../../view/manageuser/manageuser.component';
import { ProfileuserComponent } from 'app/view/manageuser/profileuser/profileuser.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatCardModule, //petch add
    MatIconModule, //petch add
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    DataTablesModule,
    AngularEditorModule,
    PdfViewerModule,
    NgApexchartsModule,
   
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    EmployeeComponent,
    UpgradeComponent,
    ThaiDatePipe,
    TableDetailComponent,
    TableMainComponent,
    DataDetailComponent,
    ThaicountyComponent,
    ProfileComponent,
    MapComponent,
    // SignatureComponent,
  
    ReportuserComponent,
   
    ReportuserbuildComponent,
    ManageuserComponent,
    ProfileuserComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line if needed
})

export class AdminLayoutModule {}
