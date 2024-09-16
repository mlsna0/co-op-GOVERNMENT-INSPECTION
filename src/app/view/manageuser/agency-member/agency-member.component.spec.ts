import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyMemberComponent } from './agency-member.component';

describe('AgencyMemberComponent', () => {
  let component: AgencyMemberComponent;
  let fixture: ComponentFixture<AgencyMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgencyMemberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgencyMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
