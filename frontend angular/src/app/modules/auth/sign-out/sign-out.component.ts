import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector     : 'auth-sign-out',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [NgIf, RouterLink, I18nPluralPipe],
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown: number = 5; // countdown for the user to see before redirecting
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Start a countdown before signing the user out
        const countdownInterval = setInterval(() => {
            if (this.countdown > 0) {
                this.countdown--;
            } else {
                clearInterval(countdownInterval);
                this._signOutAndRedirect();
            }
        }, 1000); // Update every second
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions to prevent memory leaks
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private _signOutAndRedirect(): void {
        // Perform sign-out
        this._authService.signOut().subscribe(() => {
            // Once sign-out is successful, navigate to the login page or any other page you want
            this._router.navigate(['/sign-in']);
        });
    }
}
