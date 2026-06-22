import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);

    // Check if the user is logged in by verifying if the session has a username
    const username = sessionStorage.getItem('username');

    if (!username) {
        // If the user is not logged in, redirect to the sign-in page
        router.navigate(['/sign-in']);
        return of(false);
    }

    // If the user is logged in, allow access to the route
    return of(true);
};
