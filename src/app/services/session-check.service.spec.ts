import { TestBed } from '@angular/core/testing';

import { SessionCheckService } from './session-check.service';

describe('SessionCheckService', () => {
  let service: SessionCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
