import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgerylistComponent } from './surgerylist.component';

describe('SurgerylistComponent', () => {
  let component: SurgerylistComponent;
  let fixture: ComponentFixture<SurgerylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgerylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgerylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
