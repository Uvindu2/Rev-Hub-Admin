import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { finalize } from 'rxjs';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notificationService';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [
    NgxExtendedPdfViewerModule,
    NgIf
  ],
  templateUrl: './pdf-preview.html',
  styleUrl: './pdf-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfPreview implements OnInit {

  pdfBase64: string | null = null;

  documentType = '';

  documentId!: number;

  documentTitle = 'PDF Preview';

  isLoading = false;

  errorMessage = '';

  returnUrl = '/dashboard';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.documentType = params.get('type') || '';

      const id = params.get('id');

      if (!id) {
        this.handleInvalidDocument();
        return;
      }

      this.documentId = Number(id);

      if (!Number.isFinite(this.documentId)) {
        this.handleInvalidDocument();
        return;
      }

      this.loadDocument();

    });

  }

  private loadDocument(): void {

    this.isLoading = true;
    this.errorMessage = '';
    this.pdfBase64 = null;

    this.setDocumentDetails();

    this.cdr.markForCheck();

    if (this.documentType === 'invoice') {

      this.loadInvoicePdf();

      return;
    }

    if (this.documentType === 'job-card') {

      this.loadJobCardPdf();

      return;
    }

    this.handleInvalidDocument();

  }

  private loadInvoicePdf(): void {

    this.adminService
      .getJobCardById(this.documentId)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.cdr.markForCheck();

        })
      )
      .subscribe({

        next: (response: any) => {

          const base64 = response?.data || response;

          if (!base64 || typeof base64 !== 'string') {

            this.handlePdfError();

            return;
          }

          this.pdfBase64 = this.cleanBase64(base64);

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load invoice PDF:',
            error
          );

          this.handlePdfError();

        }

      });

  }

  private loadJobCardPdf(): void {

    this.adminService
      .getJobCardPdfById(this.documentId)
      .pipe(
        finalize(() => {

          this.isLoading = false;

          this.cdr.markForCheck();

        })
      )
      .subscribe({

        next: (response: any) => {

          const base64 = response?.data || response;

          if (!base64 || typeof base64 !== 'string') {

            this.handlePdfError();

            return;
          }

          this.pdfBase64 = this.cleanBase64(base64);

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load job card PDF:',
            error
          );

          this.handlePdfError();

        }

      });

  }

  private cleanBase64(base64: string): string {

    return base64
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/\s/g, '');

  }

  private setDocumentDetails(): void {

    if (this.documentType === 'invoice') {

      this.documentTitle = 'Invoice PDF Preview';

      this.returnUrl = '/dashboard/invoices';

      return;
    }

    if (this.documentType === 'job-card') {

      this.documentTitle = 'Job Card PDF Preview';

      this.returnUrl = '/dashboard/job-cards';

      return;
    }

    this.documentTitle = 'PDF Preview';

    this.returnUrl = '/dashboard';

  }

  private handlePdfError(): void {

    this.pdfBase64 = null;

    this.errorMessage =
      'Unable to load the PDF document. Please try again.';

    this.notificationService.show(
      this.errorMessage,
      'error'
    );

    this.cdr.markForCheck();

  }

  private handleInvalidDocument(): void {

    this.notificationService.show(
      'Invalid PDF document.',
      'error'
    );

    this.router.navigateByUrl('/dashboard');

  }

  goBack(): void {

    this.router.navigateByUrl(this.returnUrl);

  }

}
