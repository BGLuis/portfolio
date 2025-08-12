import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Init } from './init';

describe('Init', () => {
  let component: Init;
  let fixture: ComponentFixture<Init>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Init]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Init);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
