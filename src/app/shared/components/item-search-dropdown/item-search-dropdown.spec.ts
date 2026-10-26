import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemSearchDropdown } from './item-search-dropdown';

describe('ItemSearchDropdown', () => {
  let component: ItemSearchDropdown;
  let fixture: ComponentFixture<ItemSearchDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemSearchDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemSearchDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
