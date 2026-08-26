import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dropdown.css',
})
export class Dropdown implements ControlValueAccessor, OnInit {
    @Input() label = '';
  @Input() data: any[] = [];
  @Input() bindLabel: string = '';
  @Input() bindValue: string = '';

  // Custom error message input string
  @Input() errorMessage: string = 'This field is required.';

  isOpen = false;
  searchText = '';
  value: any = null;
  selectedDisplayLabel = '';

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
    return !!(
      this.ngControl &&
      this.ngControl.invalid &&
      (this.ngControl.touched || this.ngControl.dirty)
    );
  }

  writeValue(value: any): void {
    this.value = value !== undefined ? value : null;
    this.updateDisplayLabel();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  private getItemValue(item: any): any {
    return this.bindValue ? item[this.bindValue] : item;
  }

  getItemLabel(item: any): string {
    if (item === null || item === undefined) return '';
    if (typeof item !== 'object') {
      if (this.bindValue && this.data) {
        const matchingObject = this.data.find((x) => x[this.bindValue] == item);
        return matchingObject && this.bindLabel ? matchingObject[this.bindLabel] : item.toString();
      }
      return item.toString();
    }
    return this.bindLabel ? item[this.bindLabel] : item.toString();
  }

  updateDisplayLabel() {
    if (this.value === null || this.value === undefined || this.value === '') {
      this.selectedDisplayLabel = '';
      return;
    }
    if (this.bindValue && this.data) {
      const found = this.data.find((x) => x[this.bindValue] === this.value);
      this.selectedDisplayLabel = found ? found[this.bindLabel] : this.value;
    } else {
      this.selectedDisplayLabel = this.getItemLabel(this.value);
    }
  }

  isSelected(item: any): boolean {
    return this.getItemValue(item) === this.value;
  }

  selectItem(item: any) {
    const targetValue = this.getItemValue(item);
    this.value = targetValue;
    this.selectedDisplayLabel = this.getItemLabel(item);
    this.searchText = ''; // clear search text after selection
    this.isOpen = false;
    this.onChange(this.value);
    this.onTouched();
  }

  get filteredItems(): any[] {
    if (!this.searchText) return this.data;

    // Remove all whitespace from the search query
    const cleanedSearchText = this.searchText.replace(/\s+/g, '').toLowerCase();

    return this.data.filter((i) => {
      // Remove all whitespace from the item's label
      const cleanedLabel = this.getItemLabel(i).replace(/\s+/g, '').toLowerCase();

      return cleanedLabel.includes(cleanedSearchText);
    });
  }
}
