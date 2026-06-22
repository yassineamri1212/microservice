import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, Observable, throwError } from 'rxjs';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    let newReq = req.clone();

    if (authService.accessToken) {
        newReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authService.accessToken}`),
        });
    }

    return next(newReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // Handle unauthorized errors
                authService.signOut();
                location.reload();
            }
            return throwError(error);
        }),
    );
};
