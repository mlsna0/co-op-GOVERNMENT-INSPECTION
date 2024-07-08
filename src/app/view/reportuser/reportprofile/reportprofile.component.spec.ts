import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportprofileComponent } from './reportprofile.component';

describe('ReportprofileComponent', () => {
  let component: ReportprofileComponent;
  let fixture: ComponentFixture<ReportprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportprofileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
