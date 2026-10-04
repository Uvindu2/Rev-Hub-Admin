import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDropdown } from './search-dropdown';

describe('SearchDropdown', () => {
  let component: SearchDropdown;
  let fixture: ComponentFixture<SearchDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
