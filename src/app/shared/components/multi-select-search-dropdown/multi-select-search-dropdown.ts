import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ControlValueAccessor,
  FormsModule,
  NgControl
} from '@angular/forms';

@Component({
  selector: 'app-multi-select-search-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './multi-select-search-dropdown.html',
  styleUrls: ['./multi-select-search-dropdown.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class MultiSelectDropdown
  implements ControlValueAccessor, OnInit {


  /* =======================================================
     INPUTS
     ======================================================= */

  @Input() label = '';

  @Input() data: any[] = [];

  @Input() bindLabel = '';

  @Input() bindValue = '';

  @Input() errorMessage =
    'This field is required.';


  /* =======================================================
     VIEW
     ======================================================= */

  @ViewChild('searchInput')
  searchInput?: ElementRef<HTMLInputElement>;


  /* =======================================================
     STATE
     ======================================================= */

  isOpen = false;

  searchText = '';

  value: any[] = [];


  /* =======================================================
     CONTROL VALUE ACCESSOR
     ======================================================= */

  onChange = (value: any[]) => {};

  onTouched = () => {};


  /* =======================================================
     CONSTRUCTOR
     ======================================================= */

  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl,

    private elementRef: ElementRef
  ) {

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

  }


  /* =======================================================
     INIT
     ======================================================= */

  ngOnInit(): void {}


  /* =======================================================
     VALIDATION
     ======================================================= */

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


  /* =======================================================
     CONTROL VALUE ACCESSOR
     ======================================================= */

  writeValue(value: any[]): void {

    this.value = Array.isArray(value)
      ? [...value]
      : [];

  }


  registerOnChange(fn: any): void {

    this.onChange = fn;

  }


  registerOnTouched(fn: any): void {

    this.onTouched = fn;

  }


  /* =======================================================
     DROPDOWN TOGGLE
     ======================================================= */

  toggleDropdown(): void {

    this.isOpen = !this.isOpen;


    if (this.isOpen) {

      this.searchText = '';


      // Focus search box after rendering
      setTimeout(() => {

        this.searchInput?.nativeElement.focus();

      });

    } else {

      this.searchText = '';

      this.onTouched();

    }

  }


  /* =======================================================
     CLOSE WHEN CLICKING OUTSIDE
     ======================================================= */

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent): void {

    const clickedInside =
      this.elementRef.nativeElement.contains(
        event.target
      );


    if (
      !clickedInside &&
      this.isOpen
    ) {

      this.isOpen = false;

      this.searchText = '';

      this.onTouched();

    }

  }


  /* =======================================================
     GET VALUE
     ======================================================= */

  private getItemValue(item: any): any {

    return this.bindValue
      ? item[this.bindValue]
      : item;

  }


  /* =======================================================
     GET LABEL
     ======================================================= */

  getItemLabel(item: any): string {

    if (
      item === null ||
      item === undefined
    ) {

      return '';

    }


    // Primitive value

    if (
      typeof item !== 'object'
    ) {

      if (
        this.bindValue &&
        this.data
      ) {

        const matchingObject =
          this.data.find(
            x =>
              x[this.bindValue] == item
          );


        return (
          matchingObject &&
          this.bindLabel
        )
          ? matchingObject[this.bindLabel]
          : item.toString();

      }


      return item.toString();

    }


    // Object

    return this.bindLabel
      ? item[this.bindLabel]
      : item.toString();

  }


  /* =======================================================
     GET SELECTED LABEL
     ======================================================= */

  getSelectedLabel(
    selectedValue: any
  ): string {

    if (this.bindValue) {

      const found =
        this.data.find(
          x =>
            x[this.bindValue] ===
            selectedValue
        );


      return found
        ? found[this.bindLabel]
        : selectedValue;

    }


    return this.getItemLabel(
      selectedValue
    );

  }


  /* =======================================================
     SELECTED DISPLAY TEXT
     ======================================================= */

  get selectedDisplayText(): string {

    if (this.value.length === 0) {

      return 'Select options...';

    }


    if (this.value.length === 1) {

      return this.getSelectedLabel(
        this.value[0]
      );

    }


    return `${this.value.length} options selected`;

  }


  /* =======================================================
     CHECK SELECTED
     ======================================================= */

  isSelected(item: any): boolean {

    const itemValue =
      this.getItemValue(item);


    return this.value.includes(
      itemValue
    );

  }


  /* =======================================================
     TOGGLE ITEM
     ======================================================= */

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


  /* =======================================================
     REMOVE SELECTED TAG
     ======================================================= */

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


  /* =======================================================
     SEARCH / FILTER
     ======================================================= */

  get filteredItems(): any[] {

    if (!this.searchText) {

      return this.data;

    }


    const search =
      this.searchText
        .replace(/\s+/g, '')
        .toLowerCase();


    return this.data.filter(
      item => {

        const label =
          this.getItemLabel(item)
            .replace(/\s+/g, '')
            .toLowerCase();


        return label.includes(search);

      }
    );

  }


  /* =======================================================
     ALL FILTERED ITEMS SELECTED
     ======================================================= */

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


  /* =======================================================
     SOME FILTERED ITEMS SELECTED
     ======================================================= */

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


  /* =======================================================
     SELECT / DESELECT ALL
     ======================================================= */

  toggleSelectAll(): void {

    const filteredValues =
      this.filteredItems.map(
        item =>
          this.getItemValue(item)
      );


    if (
      this.areAllFilteredSelected()
    ) {

      // Deselect filtered items

      this.value =
        this.value.filter(
          value =>
            !filteredValues.includes(value)
        );

    } else {

      // Select filtered items

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
