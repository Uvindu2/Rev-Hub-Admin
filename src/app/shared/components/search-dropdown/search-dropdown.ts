import {
  CommonModule
} from '@angular/common';

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

import {
  ControlValueAccessor,
  FormsModule,
  NgControl
} from '@angular/forms';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './search-dropdown.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search-dropdown.css',
})
export class SearchDropdown implements ControlValueAccessor, OnInit {

  @Input() label = '';

  @Input() data: any[] = [];

  @Input() bindLabel: string = '';

  @Input() bindValue: string = '';

  @Input() allValue!: null;

  @Input() errorMessage: string =
    'This field is required.';

  @Input() showAllOption: boolean = false;

  @Input() allLabel: string = 'All';


  @ViewChild('searchInput')
  searchInput?: ElementRef<HTMLInputElement>;


  isOpen = false;

  searchText = '';

  value: any = null;

  selectedDisplayLabel = '';


  onChange = (value: any) => {};

  onTouched = () => {};


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


  ngOnInit(): void {}


  // =========================================
  // VALIDATION
  // =========================================

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


  // =========================================
  // CONTROL VALUE ACCESSOR
  // =========================================

  writeValue(value: any): void {

    this.value = value ?? null;

    this.updateDisplayLabel();

  }


  registerOnChange(fn: any): void {

    this.onChange = fn;

  }


  registerOnTouched(fn: any): void {

    this.onTouched = fn;

  }


  // =========================================
  // DROPDOWN OPEN / CLOSE
  // =========================================

  toggleDropdown(): void {

    this.isOpen = !this.isOpen;

    if (this.isOpen) {

      this.searchText = '';

      // Focus search input after panel is rendered
      setTimeout(() => {

        this.searchInput?.nativeElement.focus();

      });

    } else {

      this.onTouched();

    }

  }


  // =========================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =========================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const clickedInside =
      this.elementRef.nativeElement.contains(
        event.target
      );

    if (!clickedInside && this.isOpen) {

      this.isOpen = false;

      this.searchText = '';

      this.onTouched();

    }

  }


  // =========================================
  // VALUE
  // =========================================

  private getItemValue(item: any): any {

    return this.bindValue
      ? item[this.bindValue]
      : item;

  }


  // =========================================
  // LABEL
  // =========================================

  getItemLabel(item: any): string {

    if (
      item === null ||
      item === undefined
    ) {
      return '';
    }


    if (typeof item !== 'object') {

      if (
        this.bindValue &&
        this.data
      ) {

        const matchingObject =
          this.data.find(
            x =>
              x[this.bindValue] == item
          );


        return matchingObject && this.bindLabel
          ? matchingObject[this.bindLabel]
          : item.toString();

      }


      return item.toString();

    }


    return this.bindLabel
      ? item[this.bindLabel]
      : item.toString();

  }


  // =========================================
  // DISPLAY SELECTED LABEL
  // =========================================

  updateDisplayLabel(): void {

    // NULL = ALL
    if (this.value === null) {

      this.selectedDisplayLabel =
        this.showAllOption
          ? this.allLabel
          : '';

      return;

    }


    if (
      this.value === undefined ||
      this.value === ''
    ) {

      this.selectedDisplayLabel = '';

      return;

    }


    if (
      this.bindValue &&
      this.data
    ) {

      const found =
        this.data.find(
          x =>
            x[this.bindValue] === this.value
        );


      this.selectedDisplayLabel =
        found
          ? found[this.bindLabel]
          : this.value;

    } else {

      this.selectedDisplayLabel =
        this.getItemLabel(this.value);

    }

  }


  // =========================================
  // SELECTED
  // =========================================

  isSelected(item: any): boolean {

    return (
      this.getItemValue(item) ===
      this.value
    );

  }


  // =========================================
  // SELECT ITEM
  // =========================================

  selectItem(item: any): void {

    const targetValue =
      this.getItemValue(item);


    this.value = targetValue;

    this.selectedDisplayLabel =
      this.getItemLabel(item);


    this.searchText = '';

    this.isOpen = false;


    this.onChange(this.value);

    this.onTouched();

  }


  // =========================================
  // SELECT ALL
  // =========================================

  selectAll(): void {

    this.value = null;

    this.selectedDisplayLabel =
      this.allLabel;

    this.searchText = '';

    this.isOpen = false;


    this.onChange(null);

    this.onTouched();

  }


  // =========================================
  // FILTER
  // =========================================

  get filteredItems(): any[] {

    if (!this.searchText) {

      return this.data;

    }


    const cleanedSearchText =
      this.searchText
        .replace(/\s+/g, '')
        .toLowerCase();


    return this.data.filter(item => {

      const cleanedLabel =
        this.getItemLabel(item)
          .replace(/\s+/g, '')
          .toLowerCase();


      return cleanedLabel.includes(
        cleanedSearchText
      );

    });

  }

}
