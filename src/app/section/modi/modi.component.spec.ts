import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModiComponent } from './modi.component';

describe('ModiComponent', () => {
  let component: ModiComponent;
  let fixture: ComponentFixture<ModiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
