import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-print-preview',
  imports: [],
  templateUrl: './print-preview.html',
  styleUrl: './print-preview.css',
})
export class PrintPreview {
  @Input() pdfUrl: SafeResourceUrl | null = null;
    @Output() close = new EventEmitter<void>();

    onClose(): void {
      this.close.emit();
    }
  }
