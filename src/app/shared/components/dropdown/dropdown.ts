import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Optional,
  Self
} from '@angular/core';

import {
  NgForOf,
  NgIf
} from '@angular/common';

import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-dropdown',

  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],

  templateUrl: './dropdown.html',
  standalone: true,
  styleUrl: './dropdown.css'
})
export class Dropdown implements ControlValueAccessor {

  /* =========================================================
     INPUTS
     ========================================================= */

  @Input() label = '';

  @Input() data: any[] = [];

  @Input() bindLabel: string = '';

  @Input() bindValue: string = '';

  @Input() allValue!: null;

  @Input() errorMessage: string =
    'This field is required.';

  @Input() showAllOption: boolean = false;

  @Input() allLabel: string = 'All';

  /* =========================================================
     DROPDOWN STATE
     ========================================================= */

  disabled = false;

  isOpen = false;

  value: any = null;

  selectedDisplayLabel = '';


  /* =========================================================
     CONTROL VALUE ACCESSOR
     ========================================================= */

  onChange = (value: any) => {};

  onTouched = () => {};


  /* =========================================================
     CONSTRUCTOR
     ========================================================= */

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


  /* =========================================================
     VALIDATION
     ========================================================= */

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


  /* =========================================================
     CONTROL VALUE ACCESSOR
     ========================================================= */

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


  /* =========================================================
     DROPDOWN OPEN / CLOSE
     ========================================================= */


  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;

    if (!this.isOpen) {
      this.onTouched();
    }
  }



  /* =========================================================
     CLOSE WHEN CLICKING OUTSIDE
     ========================================================= */

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent): void {

    const clickedInside =
      this.elementRef.nativeElement.contains(
        event.target
      );

    if (!clickedInside && this.isOpen) {

      this.isOpen = false;

      this.onTouched();

    }

  }


  /* =========================================================
     VALUE
     ========================================================= */

  private getItemValue(item: any): any {

    return this.bindValue
      ? item[this.bindValue]
      : item;

  }


  /* =========================================================
     LABEL
     ========================================================= */

  getItemLabel(item: any): string {

    if (
      item === null ||
      item === undefined
    ) {
      return '';
    }


    /*
     * Primitive value
     */
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


    /*
     * Object value
     */
    return this.bindLabel
      ? item[this.bindLabel]
      : item.toString();

  }


  /* =========================================================
     DISPLAY SELECTED LABEL
     ========================================================= */

  updateDisplayLabel(): void {

    /*
     * NULL = ALL
     */
    if (this.value === null) {

      this.selectedDisplayLabel =
        this.showAllOption
          ? this.allLabel
          : '';

      return;

    }


    /*
     * EMPTY VALUE
     */
    if (
      this.value === undefined ||
      this.value === ''
    ) {

      this.selectedDisplayLabel = '';

      return;

    }


    /*
     * OBJECT DATA + BIND VALUE
     */
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

    }

    /*
     * DIRECT VALUE
     */
    else {

      this.selectedDisplayLabel =
        this.getItemLabel(this.value);

    }

  }


  /* =========================================================
     CHECK SELECTED ITEM
     ========================================================= */

  isSelected(item: any): boolean {

    return (
      this.getItemValue(item) ===
      this.value
    );

  }


  /* =========================================================
     SELECT ITEM
     ========================================================= */


  selectItem(item: any): void {
    if (this.disabled) {
      return;
    }

    const targetValue = this.getItemValue(item);

    this.value = targetValue;
    this.selectedDisplayLabel = this.getItemLabel(item);
    this.isOpen = false;

    this.onChange(this.value);
    this.onTouched();
  }

  /* =========================================================
     SELECT ALL
     ========================================================= */

  selectAll(): void {
    if (this.disabled) {
      return;
    }

    this.value = null;
    this.selectedDisplayLabel = this.allLabel;
    this.isOpen = false;

    this.onChange(null);
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled) {
      this.isOpen = false;
    }
  }


}
