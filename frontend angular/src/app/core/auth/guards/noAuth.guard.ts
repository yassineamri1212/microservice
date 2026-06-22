import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);

    // Check the authentication status
    return inject(AuthService).check().pipe(
        switchMap((authenticated) => {
            if (authenticated) {
                // Redirect authenticated users to a specific route
                router.navigate(['/dashboard']);
                return of(false);
            }

            // Allow access to the route
            return of(true);
        }),
    );
};
