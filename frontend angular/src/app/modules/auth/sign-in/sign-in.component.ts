import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from "rxjs";
import { environment } from "../../../../keycloak-config";
import { HttpClient } from "@angular/common/http";

declare var gapi: any; // Declare gapi to use Google Sign-In
declare var google: any;
@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseAlertComponent,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        NgClass,
        RouterLink,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: string; message: string } = {
        type: 'success',
        message: '',
    };

    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        sessionStorage.clear();
        console.log('User session cleared');

        // Initialize the form
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [false],
        });

        // Initialize Google Sign-In
    }



    signIn(): void {
        if (this.signInForm.invalid) {
            return;
        }

        this.signInForm.disable();
        this.showAlert = false;

        const { email, password, rememberMe } = this.signInForm.value;

        this._authService.signIn(email, password).subscribe(
            (response) => {
                console.log('Authentication Response:', response);

                const token = response;

                if (token) {
                    sessionStorage.setItem('access_token', token);

                    try {
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        const resourceAccess = decodedToken?.resource_access;
                        const clientRoles = resourceAccess[environment.keycloak.clientId]?.roles || [];
                        console.log('Client Roles:', clientRoles);
                        sessionStorage.setItem('roles', JSON.stringify(resourceAccess));
                    } catch (error) {
                        console.error('Error decoding token:', error);
                        this.showAlert = true;
                        this.alert.type = 'error';
                        this.alert.message = 'Error decoding token. Please try again.';
                        this.signInForm.enable();
                        return;
                    }

                    this._router.navigateByUrl('profile');
                } else {
                    console.error('Token not found in response');
                    this.showAlert = true;
                    this.alert.type = 'error';
                    this.alert.message = 'Authentication failed. Please try again.';
                    this.signInForm.enable();
                }
            },
            (error) => {
                console.error('Error during authentication:', error);
                this.showAlert = true;
                this.alert.type = 'error';
                this.alert.message = 'Authentication failed. Please try again.';
                this.signInForm.enable();
            }
        );
    }

    // Google login



}
