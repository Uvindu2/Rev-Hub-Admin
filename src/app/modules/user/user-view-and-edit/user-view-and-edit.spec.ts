import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserViewAndEdit } from './user-view-and-edit';

describe('UserViewAndEdit', () => {
  let component: UserViewAndEdit;
  let fixture: ComponentFixture<UserViewAndEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserViewAndEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(UserViewAndEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
