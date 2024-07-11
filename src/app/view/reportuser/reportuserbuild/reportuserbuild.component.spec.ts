import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportuserbuildComponent } from './reportuserbuild.component';

describe('ReportuserbuildComponent', () => {
  let component: ReportuserbuildComponent;
  let fixture: ComponentFixture<ReportuserbuildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportuserbuildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportuserbuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
