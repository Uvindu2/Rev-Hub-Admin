import { Component, Input, OnInit, Self, Optional, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select-dropdown.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./multi-select-dropdown.css']
})
export class MultiSelectDropdown implements ControlValueAccessor, OnInit {
  @Input() label = '';
  @Input() b: any[] = [];
  @Input() bindLabel: string = '';
  @Input() bindValue: string = '';

  // Custom error message input string
  @Input() errorMessage: string = 'This field is required.';

  isOpen = false;
  searchText = '';
  value: any[] = [];

  onChange = (value: any) => {};
  onTouched = () => {};

  constructor(@Self() @Optional() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {}

  // If there are no validators on the parent form control, ngControl.invalid is false.
  get isInvalid(): boolean {
    return !!(this.ngControl && this.ngControl.invalid && (this.ngControl.touched || this.ngControl.dirty));
  }

  writeValue(value: any[]): void { this.value = value || []; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  private getItemValue(item: any): any { return this.bindValue ? item[this.bindValue] : item; }

  getItemLabel(item: any): string {
    if (item === null || item === undefined) return '';
    if (typeof item !== 'object') {
      if (this.bindValue && this.b) {
        const matchingObject = this.b.find(x => x[this.bindValue] == item);
        return matchingObject && this.bindLabel ? matchingObject[this.bindLabel] : item.toString();
      }
      return item.toString();
    }
    return this.bindLabel ? item[this.bindLabel] : item.toString();
  }

  getSelectedLabel(selectedValue: any): string {
    if (this.bindValue) {
      const found = this.b.find(x => x[this.bindValue] === selectedValue);
      return found ? found[this.bindLabel] : selectedValue;
    }
    return this.getItemLabel(selectedValue);
  }

  isSelected(item: any): boolean { return this.value.includes(this.getItemValue(item)); }

  toggle(item: any) {
    const targetValue = this.getItemValue(item);
    if (this.isSelected(item)) {
      this.value = this.value.filter(x => x !== targetValue);
    } else {
      this.value = [...this.value, targetValue];
    }
    this.onChange(this.value);
    this.onTouched();
  }

  remove(selectedValue: any) {
    this.value = this.value.filter(x => x !== selectedValue);
    this.onChange(this.value);
    this.onTouched();
  }

  get filteredItems(): any[] {
    if (!this.searchText) return this.b;
    return this.b.filter(i => this.getItemLabel(i).toLowerCase().includes(this.searchText.toLowerCase()));
  }
}
