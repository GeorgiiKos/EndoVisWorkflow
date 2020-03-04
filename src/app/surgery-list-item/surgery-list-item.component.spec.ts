import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryListItemComponent } from './surgery-list-item.component';

describe('SurgeryListItemComponent', () => {
  let component: SurgeryListItemComponent;
  let fixture: ComponentFixture<SurgeryListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgeryListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgeryListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
