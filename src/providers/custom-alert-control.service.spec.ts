import { TestBed } from '@angular/core/testing';

import { CustomAlertControlService } from './custom-alert-control.service';

describe('CustomAlertControlService', () => {
  let service: CustomAlertControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomAlertControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
