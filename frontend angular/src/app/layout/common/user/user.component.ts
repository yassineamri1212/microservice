import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import {AuthService} from "../../../core/auth/auth.service";
import {UserService} from "../../../user.service";

@Component({
    selector       : 'user',
    templateUrl    : './user.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'user',
    standalone     : true,
    imports        : [MatButtonModule, MatMenuModule, NgIf, MatIconModule, NgClass, MatDividerModule],

})
export class UserComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    user: User;
    image :string ="assets/images/avatars/"+sessionStorage.getItem('avatar');
    status :string="online";
    id    :string ='cfaad35d-07a3-4447-a6c3-d8c3d54fd5df';
    name  :string ='Brian Hughes';
    email :string= 'hughes.brian@company.com';

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userProfile: User | null = null;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private authService: AuthService
    )
    {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Subscribe to user changes
        this.authService.getCurrentUserProfile().subscribe(userProfile => {
            this.userProfile = userProfile;

            this._userService.getUserByEmail(sessionStorage.getItem('email')).subscribe({
                next: (data) => {
                    this.userProfile.name=data.firstName;
                }
                });
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void
    {
        // Return if user is not available
        if ( !this.user )
        {
            return;
        }

        // Update the user

    }

    /**
     * Sign out
     */
    signOut(): void {
        // Use AuthService to sign out
        this._router.navigate(['/sign-out']); // Update to your desired route

    }


    protected readonly sessionStorage = sessionStorage;
}
