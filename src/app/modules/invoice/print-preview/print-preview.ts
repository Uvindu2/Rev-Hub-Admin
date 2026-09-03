import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-print-preview',
  imports: [],
  templateUrl: './print-preview.html',
  styleUrl: './print-preview.css',
})
export class PrintPreview {
  @Input() pdfName: String = "Print Preview";
  @Input() pdfUrl: SafeResourceUrl | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  printPdf(): void {
    const iframeElement = document.querySelector('.custom-preview-body iframe') as HTMLIFrameElement;
    if (iframeElement && iframeElement.contentWindow) {
      iframeElement.contentWindow.focus();
      iframeElement.contentWindow.print();
    }
  }
}
