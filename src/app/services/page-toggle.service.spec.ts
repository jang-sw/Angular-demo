import { TestBed } from '@angular/core/testing';

import { PageToggleService } from './page-toggle.service';

describe('PageToggleService', () => {
  let service: PageToggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageToggleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
