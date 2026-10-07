import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { finalize } from 'rxjs';

import {
  NgxExtendedPdfViewerModule,
  NgxExtendedPdfViewerService
} from 'ngx-extended-pdf-viewer';

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
export class PdfPreview implements OnInit, OnDestroy {


  /* =========================================================
     PDF DATA
     ========================================================= */

  pdfBase64: string | null = null;

  private rawPdfUrl: string | null = null;


  /* =========================================================
     DOCUMENT
     ========================================================= */

  documentType = '';

  documentId!: number;

  documentTitle = 'PDF Preview';

  isLoading = false;

  errorMessage = '';

  returnUrl = '/dashboard';


  /* =========================================================
     CONSTRUCTOR
     ========================================================= */

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,

    /*
     * IMPORTANT:
     *
     * ngx-extended-pdf-viewer provides this service
     * specifically for programmatic PDF actions,
     * including printing.
     */
    private readonly pdfViewerService: NgxExtendedPdfViewerService
  ) {
  }


  /* =========================================================
     ON INIT
     ========================================================= */

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.documentType =
        params.get('type') || '';

      const id =
        params.get('id');


      /* -----------------------------------------------------
         VALIDATE ID
         ----------------------------------------------------- */

      if (!id) {

        this.handleInvalidDocument();

        return;
      }


      this.documentId =
        Number(id);


      if (!Number.isFinite(this.documentId)) {

        this.handleInvalidDocument();

        return;
      }


      /* -----------------------------------------------------
         LOAD DOCUMENT
         ----------------------------------------------------- */

      this.loadDocument();

    });

  }


  /* =========================================================
     LOAD DOCUMENT
     ========================================================= */

  private loadDocument(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.pdfBase64 = null;

    this.clearPdfUrl();

    this.setDocumentDetails();

    this.cdr.markForCheck();


    /* -------------------------------------------------------
       INVOICE
       ------------------------------------------------------- */

    if (this.documentType === 'invoice') {

      this.loadInvoicePdf();

      return;
    }


    /* -------------------------------------------------------
       JOB CARD
       ------------------------------------------------------- */

    if (this.documentType === 'job-card') {

      this.loadJobCardPdf();

      return;
    }


    /* -------------------------------------------------------
       INVALID TYPE
       ------------------------------------------------------- */

    this.handleInvalidDocument();

  }


  /* =========================================================
     LOAD INVOICE PDF
     ========================================================= */

  private loadInvoicePdf(): void {

    this.adminService
      .viewInvoice(this.documentId)

      .pipe(

        finalize(() => {

          this.isLoading = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (response: any) => {

          const base64 =
            response?.data || response;


          /* -------------------------------------------------
             VALIDATE RESPONSE
             ------------------------------------------------- */

          if (
            !base64 ||
            typeof base64 !== 'string'
          ) {

            this.handlePdfError();

            return;
          }


          /* -------------------------------------------------
             SET PDF
             ------------------------------------------------- */

          this.setPdf(base64);

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


  /* =========================================================
     LOAD JOB CARD PDF
     ========================================================= */

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

          const base64 =
            response?.data || response;


          /* -------------------------------------------------
             VALIDATE RESPONSE
             ------------------------------------------------- */

          if (
            !base64 ||
            typeof base64 !== 'string'
          ) {

            this.handlePdfError();

            return;
          }


          /* -------------------------------------------------
             SET PDF
             ------------------------------------------------- */

          this.setPdf(base64);

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


  /* =========================================================
     SET PDF
     ========================================================= */

  private setPdf(base64: string): void {

    /* -------------------------------------------------------
       CLEAN BASE64
       ------------------------------------------------------- */

    this.pdfBase64 =
      this.cleanBase64(base64);


    /* -------------------------------------------------------
       CREATE BLOB URL
       ------------------------------------------------------- */

    this.rawPdfUrl =
      this.createPdfBlobUrl(
        this.pdfBase64
      );


    /* -------------------------------------------------------
       UPDATE VIEW
       ------------------------------------------------------- */

    this.cdr.markForCheck();

  }


  /* =========================================================
     CLEAN BASE64
     ========================================================= */

  private cleanBase64(
    base64: string
  ): string {

    return base64

      .replace(
        /^data:application\/pdf;base64,/,
        ''
      )

      .replace(
        /\s/g,
        ''
      );

  }


  /* =========================================================
     BASE64 → BLOB URL
     ========================================================= */

  private createPdfBlobUrl(
    base64: string
  ): string {

    const byteCharacters =
      atob(base64);


    const byteNumbers =
      new Array(
        byteCharacters.length
      );


    for (
      let i = 0;
      i < byteCharacters.length;
      i++
    ) {

      byteNumbers[i] =
        byteCharacters.charCodeAt(i);

    }


    const byteArray =
      new Uint8Array(
        byteNumbers
      );


    const blob =
      new Blob(
        [byteArray],
        {
          type: 'application/pdf'
        }
      );


    return URL.createObjectURL(blob);

  }


  /* =========================================================
     PRINT PDF
     ========================================================= */

  printPdf(): void {

    if (!this.pdfBase64) {

      return;
    }


    try {

      /*
       * IMPORTANT
       *
       * Do NOT use:
       *
       * this.pdfViewer.print()
       *
       * Do NOT use:
       *
       * window.print()
       *
       * Use the official ngx-extended-pdf-viewer
       * service instead.
       */

      this.pdfViewerService.print();

    } catch (error) {

      console.error(
        'Unable to print PDF:',
        error
      );


      this.notificationService.show(
        'Unable to print PDF. Please try again.',
        'error'
      );

    }

  }


  /* =========================================================
     DOCUMENT DETAILS
     ========================================================= */

  private setDocumentDetails(): void {

    /* -------------------------------------------------------
       INVOICE
       ------------------------------------------------------- */

    if (
      this.documentType === 'invoice'
    ) {

      this.documentTitle =
        'Invoice PDF Preview';

      this.returnUrl =
        '/dashboard/invoices';

      return;
    }


    /* -------------------------------------------------------
       JOB CARD
       ------------------------------------------------------- */

    if (
      this.documentType === 'job-card'
    ) {

      this.documentTitle =
        'Job Card PDF Preview';

      this.returnUrl =
        '/dashboard/job-cards';

      return;
    }


    /* -------------------------------------------------------
       DEFAULT
       ------------------------------------------------------- */

    this.documentTitle =
      'PDF Preview';

    this.returnUrl =
      '/dashboard';

  }


  /* =========================================================
     PDF ERROR
     ========================================================= */

  private handlePdfError(): void {

    this.pdfBase64 = null;

    this.clearPdfUrl();


    this.errorMessage =
      'Unable to load the PDF document. Please try again.';


    this.notificationService.show(
      this.errorMessage,
      'error'
    );


    this.cdr.markForCheck();

  }


  /* =========================================================
     INVALID DOCUMENT
     ========================================================= */

  private handleInvalidDocument(): void {

    this.notificationService.show(
      'Invalid PDF document.',
      'error'
    );


    this.router.navigateByUrl(
      '/dashboard'
    );

  }


  /* =========================================================
     BACK
     ========================================================= */

  goBack(): void {

    this.router.navigateByUrl(
      this.returnUrl
    );

  }


  /* =========================================================
     CLEAR BLOB URL
     ========================================================= */

  private clearPdfUrl(): void {

    if (this.rawPdfUrl) {

      URL.revokeObjectURL(
        this.rawPdfUrl
      );

      this.rawPdfUrl = null;

    }

  }


  /* =========================================================
     DESTROY
     ========================================================= */

  ngOnDestroy(): void {

    this.clearPdfUrl();

  }

}
