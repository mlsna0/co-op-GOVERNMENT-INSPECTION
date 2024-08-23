import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageagencyComponent } from './manageagency.component';

describe('ManageagencyComponent', () => {
  let component: ManageagencyComponent;
  let fixture: ComponentFixture<ManageagencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageagencyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageagencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
