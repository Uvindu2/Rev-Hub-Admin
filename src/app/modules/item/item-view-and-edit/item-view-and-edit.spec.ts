import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemViewAndEdit } from './item-view-and-edit';

describe('ItemViewAndEdit', () => {
  let component: ItemViewAndEdit;
  let fixture: ComponentFixture<ItemViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
