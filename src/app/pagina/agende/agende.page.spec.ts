import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendePage } from './agende.page';

describe('AgendePage', () => {
  let component: AgendePage;
  let fixture: ComponentFixture<AgendePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
