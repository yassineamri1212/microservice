import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { UserService } from '../../../user.service';

@Component({
    selector: 'app-verify-code',
    templateUrl: './verify-code.component.html',
    styleUrls: ['./verify-code.component.scss'],
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
export class VerifyCodeComponent implements OnInit {
    @ViewChild('verifyCodeNgForm') verifyCodeNgForm: NgForm;

    alert: { type: string; message: string } = {
        type: 'success',
        message: '',
    };

    verifyForm: UntypedFormGroup;
    showAlert: boolean = false;
    email: string = '';
    loading = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        // Get email from query parameters
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
            if (!this.email) {
                this.router.navigate(['reset-password']);
            }
        });

        // Create the form
        this.verifyForm = this._formBuilder.group({
            verificationCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(form: UntypedFormGroup) {
        const password = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onVerifyAndReset(): void {
        // Do nothing if the form is invalid
        if (this.verifyForm.invalid) {
            return;
        }

        // Disable the form
        this.verifyForm.disable();
        this.loading = true;

        // Hide the alert
        this.showAlert = false;

        const { verificationCode, newPassword } = this.verifyForm.value;

        this.userService.verifyCodeAndResetPassword(this.email, verificationCode, newPassword).subscribe({
            next: (response) => {
                console.log('Password reset successful:', response);
                
                // Show success alert
                this.showAlert = true;
                this.alert.type = 'success';
                this.alert.message = 'Password has been reset successfully! Redirecting to sign-in...';
                this.loading = false;

                // Redirect to sign-in page after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['sign-in']);
                }, 2000);
            },
            error: (err) => {
                console.error('Error verifying code and resetting password:', err);
                
                // Show error alert
                this.showAlert = true;
                this.alert.type = 'error';
                this.alert.message = err.error?.message || 'Invalid verification code or error resetting password. Please try again.';
                
                // Re-enable the form
                this.verifyForm.enable();
                this.loading = false;
            }
        });
    }

    resendCode(): void {
        this.loading = true;
        this.showAlert = false;

        this.userService.sendVerificationCodeAndSave(this.email).subscribe({
            next: (response) => {
                console.log('Verification code resent:', response);
                
                // Show success alert
                this.showAlert = true;
                this.alert.type = 'success';
                this.alert.message = 'New verification code sent to your email.';
                this.loading = false;
            },
            error: (err) => {
                console.error('Error resending verification code:', err);
                
                // Show error alert
                this.showAlert = true;
                this.alert.type = 'error';
                this.alert.message = 'Failed to resend verification code. Please try again.';
                this.loading = false;
            }
        });
    }
}
