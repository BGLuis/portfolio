import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorLanguage } from './selector-language';

describe('SelectorLanguage', () => {
  let component: SelectorLanguage;
  let fixture: ComponentFixture<SelectorLanguage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorLanguage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorLanguage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
