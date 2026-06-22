import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { UserService } from "../../../user.service";

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
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
        MatProgressSpinnerModule,
        NgClass,
        RouterLink,
    ],
})
export class ResetPasswordComponent implements OnInit {
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: string; message: string } = {
        type: 'success',
        message: '',
    };

    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    loading = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private userservice: UserService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Create the form
        this.resetPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    sendResetEmail(): void {
        // Do nothing if the form is invalid
        if (this.resetPasswordForm.invalid) {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();
        this.loading = true;

        // Hide the alert
        this.showAlert = false;

        const email = this.resetPasswordForm.get('email').value;

        console.log('Attempting to get user by email:', email);

        // Call your user service to get the user by email to verify they exist
        this.userservice.getUserByEmail(email).subscribe({
            next: (user) => {
                console.log('User found:', user);

                // Generate and send 4-digit verification code to user's email
                this.userservice.sendVerificationCodeAndSave(email).subscribe({
                    next: (response) => {
                        console.log('Verification code sent successfully:', response);
                        
                        // Navigate to verify-code component with email parameter
                        this.router.navigate(['verify-code'], {
                            queryParams: { email: email }
                        });
                    },
                    error: (err) => {
                        console.error('Error sending verification code:', err);
                        console.error('Error details:', err.error);
                        console.error('Error status:', err.status);
                        
                        // Show the alert
                        this.showAlert = true;
                        this.alert.type = 'error';
                        this.alert.message = `Failed to send verification code: ${err.error?.message || err.message || 'Unknown error'}`;
                        
                        // Re-enable the form
                        this.resetPasswordForm.enable();
                        this.loading = false;
                    },
                });
            },
            error: (err) => {
                console.error('Error fetching user by email:', err);
                console.error('Error details:', err.error);
                console.error('Error status:', err.status);
                
                // Show the alert
                this.showAlert = true;
                this.alert.type = 'error';
                this.alert.message = `No user found with email "${email}": ${err.error?.message || err.message || 'Unknown error'}`;
                
                // Re-enable the form
                this.resetPasswordForm.enable();
                this.loading = false;
            },
        });
    }
}
