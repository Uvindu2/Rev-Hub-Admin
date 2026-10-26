
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnChanges,
  Optional,
  Self,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, NgControl } from '@angular/forms';

@Component({
  selector: 'app-item-search-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-search-dropdown.html',
  styleUrl: './item-search-dropdown.css'
})
export class ItemSearchDropdown implements OnChanges {

  @Input() label = '';
  @Input() data: any[] = [];
  @Input() bindLabel = '';
  @Input() bindValue = '';

  @Input() placeholder = 'Select option...';
  @Input() searchPlaceholder = 'Search items...';
  @Input() errorMessage = 'This field is required.';

  @Input() showAllOption = false;
  @Input() allLabel = 'All';

  // Enable only for invoice item dropdowns
  @Input() showAddNewOption = false;

  // Notify the parent invoice form
  @Output() addNewItem = new EventEmitter<void>();

  @ViewChild('searchInput')
  searchInput?: ElementRef<HTMLInputElement>;

  disabled = false;
  isOpen = false;
  searchText = '';
  value: any = null;
  selectedDisplayLabel = '';

  onChange = (_value: any) => {};
  onTouched = () => {};

  constructor(
    @Self() @Optional() public ngControl: NgControl,
    private elementRef: ElementRef
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['bindLabel'] ||
      changes['bindValue'] ||
      changes['showAllOption'] ||
      changes['allLabel']
    ) {
      this.updateDisplayLabel();
    }
  }

  get isInvalid(): boolean {
    return !!(
      this.ngControl &&
      this.ngControl.invalid &&
      (this.ngControl.touched || this.ngControl.dirty)
    );
  }

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

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled) {
      this.isOpen = false;
      this.searchText = '';
    }
  }

  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.searchText = '';

      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });
    } else {
      this.onTouched();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      !this.elementRef.nativeElement.contains(event.target) &&
      this.isOpen
    ) {
      this.isOpen = false;
      this.searchText = '';
      this.onTouched();
    }
  }

  addNewItemManually(): void {
    if (this.disabled || !this.showAddNewOption) {
      return;
    }

    this.isOpen = false;
    this.searchText = '';
    this.onTouched();

    this.addNewItem.emit();
  }

  private getItemValue(item: any): any {
    return this.bindValue
      ? item?.[this.bindValue]
      : item;
  }

  getItemLabel(item: any): string {
    if (item === null || item === undefined) {
      return '';
    }

    if (typeof item !== 'object') {
      if (this.bindValue && this.data?.length) {
        const found = this.data.find(
          x => String(x?.[this.bindValue]) === String(item)
        );

        if (found && this.bindLabel) {
          return String(found[this.bindLabel] ?? '');
        }
      }

      return String(item);
    }

    return this.bindLabel
      ? String(item[this.bindLabel] ?? '')
      : String(item);
  }

  updateDisplayLabel(): void {
    if (this.value === null) {
      this.selectedDisplayLabel =
        this.showAllOption ? this.allLabel : '';
      return;
    }

    if (this.value === undefined || this.value === '') {
      this.selectedDisplayLabel = '';
      return;
    }

    if (this.bindValue && this.data?.length) {
      const found = this.data.find(
        item =>
          String(item?.[this.bindValue]) === String(this.value)
      );

      this.selectedDisplayLabel =
        found ? this.getItemLabel(found) : '';
    } else {
      this.selectedDisplayLabel = this.getItemLabel(this.value);
    }
  }

  isSelected(item: any): boolean {
    return String(this.getItemValue(item)) === String(this.value);
  }

  selectItem(item: any): void {
    if (this.disabled) {
      return;
    }

    this.value = this.getItemValue(item);
    this.selectedDisplayLabel = this.getItemLabel(item);

    this.searchText = '';
    this.isOpen = false;

    this.onChange(this.value);
    this.onTouched();
  }

  selectAll(): void {
    if (this.disabled) {
      return;
    }

    this.value = null;
    this.selectedDisplayLabel = this.allLabel;

    this.searchText = '';
    this.isOpen = false;

    this.onChange(null);
    this.onTouched();
  }

  get filteredItems(): any[] {
    if (!this.searchText?.trim()) {
      return this.data ?? [];
    }

    const search = this.searchText
      .replace(/\s+/g, '')
      .toLowerCase();

    return (this.data ?? []).filter(item =>
      this.getItemLabel(item)
        .replace(/\s+/g, '')
        .toLowerCase()
        .includes(search)
    );
  }
}
