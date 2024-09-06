import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagepersonComponent } from './manageperson.component';

describe('ManagepersonComponent', () => {
  let component: ManagepersonComponent;
  let fixture: ComponentFixture<ManagepersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagepersonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagepersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
