import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Polygon } from './polygon';

describe('Polygon', () => {
  let component: Polygon;
  let fixture: ComponentFixture<Polygon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Polygon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Polygon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
