import { HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const ngZone = inject(NgZone);

  return next(req).pipe(
    catchError((error) => {
      // Force the error to run inside Angular's zone so the UI updates instantly
      return ngZone.run(() => throwError(() => error));
    })
  );
};
