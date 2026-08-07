import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = sessionStorage.getItem('token');

  let request = req;


  if (token) {

    request = req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`
      }

    });

  }


  return next(request).pipe(

    catchError(error => {

      if (error.status === 401) {

        sessionStorage.clear();

        window.location.href = '/login';

      }

      return throwError(() => error);

    })

  );

};
