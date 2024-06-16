import { TestBed } from '@angular/core/testing';

import { Web3ServiceService } from './web3-service.service';

describe('Web3ServiceService', () => {
  let service: Web3ServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3ServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
