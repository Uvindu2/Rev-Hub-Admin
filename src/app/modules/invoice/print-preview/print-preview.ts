import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-print-preview',
  standalone: true,
  imports: [],
  templateUrl: './print-preview.html',
  styleUrl: './print-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintPreview implements OnInit, OnDestroy {

  pdfName = 'Print Preview';
  pdfUrl: SafeResourceUrl | null = null;
  returnUrl = '/dashboard/job-cards';

  private rawPdfUrl: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;

    this.rawPdfUrl = state?.['pdfUrl'] || null;
    this.pdfName = state?.['pdfName'] || 'Print Preview';
    this.returnUrl = state?.['returnUrl'] || '/dashboard/job-cards';

    if (!this.rawPdfUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.rawPdfUrl) {
      window.URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
  }

  onClose(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  printPdf(): void {
    const iframeElement = document.querySelector('.custom-preview-body iframe') as HTMLIFrameElement | null;

    if (!iframeElement) return;

    try {
      iframeElement.contentWindow?.focus();
      iframeElement.contentWindow?.print();
    } catch (error) {
      console.error('Unable to print PDF:', error);

      if (this.rawPdfUrl) {
        window.open(this.rawPdfUrl, '_blank');
      }
    }
  }
}
