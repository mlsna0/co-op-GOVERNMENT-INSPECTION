import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportuserComponent } from './reportuser.component';

describe('ReportuserComponent', () => {
  let component: ReportuserComponent;
  let fixture: ComponentFixture<ReportuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportuserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
