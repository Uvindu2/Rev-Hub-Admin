import {
  Component,
  Input,
  OnInit,
  Self,
  Optional,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ControlValueAccessor,
  NgControl
} from '@angular/forms';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './multi-select-dropdown.html',
  styleUrls: ['./multi-select-dropdown.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class MultiSelectDropdown
  implements ControlValueAccessor, OnInit {

  @Input() label = '';

  @Input() b: any[] = [];

  @Input() bindLabel = '';

  @Input() bindValue = '';

  @Input() errorMessage =
    'This field is required.';

  isOpen = false;

  searchText = '';

  value: any[] = [];

  onChange = (value: any[]) => {};

  onTouched = () => {};


  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl
  ) {

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }


  ngOnInit(): void {
  }


  // ==============================
  // VALIDATION
  // ==============================

  get isInvalid(): boolean {

    return !!(
      this.ngControl &&
      this.ngControl.invalid &&
      (
        this.ngControl.touched ||
        this.ngControl.dirty
      )
    );
  }


  // ==============================
  // CONTROL VALUE ACCESSOR
  // ==============================

  writeValue(value: any[]): void {

    this.value = Array.isArray(value)
      ? value
      : [];

  }


  registerOnChange(fn: any): void {

    this.onChange = fn;

  }


  registerOnTouched(fn: any): void {

    this.onTouched = fn;

  }


  // ==============================
  // DROPDOWN
  // ==============================

  toggleDropdown(): void {

    this.isOpen = !this.isOpen;

    if (!this.isOpen) {

      this.onTouched();

    }

  }


  // ==============================
  // GET VALUE
  // ==============================

  private getItemValue(item: any): any {

    return this.bindValue
      ? item[this.bindValue]
      : item;

  }


  // ==============================
  // GET LABEL
  // ==============================

  getItemLabel(item: any): string {

    if (
      item === null ||
      item === undefined
    ) {

      return '';

    }


    // When selected value is primitive
    if (typeof item !== 'object') {

      if (
        this.bindValue &&
        this.b
      ) {

        const matchingObject =
          this.b.find(
            x =>
              x[this.bindValue] == item
          );

        return matchingObject &&
          this.bindLabel
          ? matchingObject[this.bindLabel]
          : item.toString();

      }

      return item.toString();

    }


    // When item is object
    return this.bindLabel
      ? item[this.bindLabel]
      : item.toString();

  }


  // ==============================
  // GET SELECTED LABEL
  // ==============================

  getSelectedLabel(
    selectedValue: any
  ): string {

    if (this.bindValue) {

      const found =
        this.b.find(
          x =>
            x[this.bindValue] === selectedValue
        );

      return found
        ? found[this.bindLabel]
        : selectedValue;

    }

    return this.getItemLabel(
      selectedValue
    );

  }


  // ==============================
  // CHECK SELECTED
  // ==============================

  isSelected(item: any): boolean {

    const itemValue =
      this.getItemValue(item);

    return this.value.includes(
      itemValue
    );

  }


  // ==============================
  // SELECT / DESELECT ITEM
  // ==============================

  toggle(item: any): void {

    const targetValue =
      this.getItemValue(item);


    if (this.isSelected(item)) {

      // Remove
      this.value =
        this.value.filter(
          x =>
            x !== targetValue
        );

    } else {

      // Add
      this.value = [
        ...this.value,
        targetValue
      ];

    }


    this.onChange(this.value);

    this.onTouched();

  }


  // ==============================
  // REMOVE SELECTED TAG
  // ==============================

  remove(
    selectedValue: any
  ): void {

    this.value =
      this.value.filter(
        x =>
          x !== selectedValue
      );

    this.onChange(this.value);

    this.onTouched();

  }


  // ==============================
  // SEARCH / FILTER
  // ==============================

  get filteredItems(): any[] {

    if (!this.searchText) {

      return this.b;

    }


    const search =
      this.searchText
        .toLowerCase()
        .trim();


    return this.b.filter(
      item =>
        this.getItemLabel(item)
          .toLowerCase()
          .includes(search)
    );

  }


  // ==============================
  // SELECT ALL
  // ==============================

  areAllFilteredSelected(): boolean {

    if (
      this.filteredItems.length === 0
    ) {

      return false;

    }


    return this.filteredItems.every(
      item =>
        this.isSelected(item)
    );

  }


  // ==============================
  // PARTIALLY SELECTED
  // ==============================

  isSomeFilteredSelected(): boolean {

    const someSelected =
      this.filteredItems.some(
        item =>
          this.isSelected(item)
      );


    return (
      someSelected &&
      !this.areAllFilteredSelected()
    );

  }


  // ==============================
  // SELECT / DESELECT ALL
  // ==============================

  toggleSelectAll(): void {

    const filteredValues =
      this.filteredItems.map(
        item =>
          this.getItemValue(item)
      );


    // --------------------------------
    // If everything is already selected
    // → Deselect filtered items
    // --------------------------------

    if (
      this.areAllFilteredSelected()
    ) {

      this.value =
        this.value.filter(
          value =>
            !filteredValues.includes(value)
        );

    }


    // --------------------------------
    // Otherwise
    // → Select filtered items
    // --------------------------------

    else {

      this.value = [
        ...this.value,

        ...filteredValues.filter(
          value =>
            !this.value.includes(value)
        )
      ];

    }


    this.onChange(this.value);

    this.onTouched();

  }

}
