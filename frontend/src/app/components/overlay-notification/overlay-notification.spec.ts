import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayNotificationComponent } from './overlay-notification-component';

describe('OverlayNotificationComponent', () => {
  let component: OverlayNotificationComponent;
  let fixture: ComponentFixture<OverlayNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverlayNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
