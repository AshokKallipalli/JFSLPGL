import { TestBed } from '@angular/core/testing';

import { CustomLoadingControlService } from './custom-loading-control.service';

describe('CustomLoadingControlService', () => {
  let service: CustomLoadingControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomLoadingControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
