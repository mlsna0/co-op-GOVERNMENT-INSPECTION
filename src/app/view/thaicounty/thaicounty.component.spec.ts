import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThaicountyComponent } from './thaicounty.component';

describe('ThaicountyComponent', () => {
  let component: ThaicountyComponent;
  let fixture: ComponentFixture<ThaicountyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThaicountyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThaicountyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
