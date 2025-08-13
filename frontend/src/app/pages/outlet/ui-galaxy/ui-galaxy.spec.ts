import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiGalaxy } from './ui-galaxy';

describe('UiGalaxy', () => {
  let component: UiGalaxy;
  let fixture: ComponentFixture<UiGalaxy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiGalaxy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiGalaxy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
