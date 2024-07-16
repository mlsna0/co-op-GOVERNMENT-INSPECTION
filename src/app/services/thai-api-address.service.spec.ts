import { TestBed } from '@angular/core/testing';

import { ThaiApiAddressService } from './thai-api-address.service';

describe('ThaiApiAddressService', () => {
  let service: ThaiApiAddressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThaiApiAddressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
