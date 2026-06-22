import { Component, ViewEncapsulation } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from "../../../user.service";
import { Usertype } from "../../../Model/usertype";
import { CommonModule } from "@angular/common";
import {MatSelectModule} from "@angular/material/select";

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, FuseAlertComponent, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
})
export class AuthSignUpComponent {
    user: Usertype = new Usertype();
    UserForm: FormGroup;

    // Alert properties
    showAlert: boolean = false;
    alert = {
        type: '',
        message: ''
    };
    image: string;

    // Date picker properties
    maxDate: Date;
    minDate: Date;

    avatars: string[] = [
        'avatar1.jpg',
        'avatar2.jpg',
        'male.png',
        'female1.png',
        'female2.png',
        'female3.png',// Add all the avatar file names you want to show
    ];
    constructor(
        private userservice: UserService,
        private router: Router,
        private authservice: AuthService,
    ) {
        // Set date constraints
        const today = new Date();
        this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // Must be at least 18
        this.minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()); // Max 100 years old

        this.UserForm = new FormGroup({
            username: new FormControl('', [
                Validators.required, 
                Validators.minLength(3),
                Validators.maxLength(20),
                Validators.pattern(/^[a-zA-Z0-9_]+$/) // Only alphanumeric and underscore
            ]),
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            email: new FormControl('', [
                Validators.required, 
                Validators.email,
                Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // More strict email validation
            ]),
            password: new FormControl('', [
                Validators.required, 
                Validators.minLength(6),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/) // At least one lowercase, uppercase, and number
            ]),
            phoneNumber: new FormControl(''),
            address: new FormControl(''),
            birthDate: new FormControl('', [Validators.required]), // Changed from age to birthDate
            age: new FormControl({value: '', disabled: true}), // Auto-calculated, read-only
            role: new FormControl('', [Validators.required]), // Role field
            avatar: new FormControl('', [Validators.required]), // Add this field

            agreements: new FormControl(false, [Validators.requiredTrue]),
        });

        // Listen for birth date changes to calculate age
        this.UserForm.get('birthDate')?.valueChanges.subscribe(birthDate => {
            if (birthDate) {
                const age = this.calculateAge(birthDate);
                this.UserForm.get('age')?.setValue(age);
                
                // Validate age is at least 18
                if (age < 18) {
                    this.UserForm.get('birthDate')?.setErrors({ minAge: true });
                } else {
                    // Clear age-related errors if age is valid
                    const errors = this.UserForm.get('birthDate')?.errors;
                    if (errors && errors['minAge']) {
                        delete errors['minAge'];
                        this.UserForm.get('birthDate')?.setErrors(Object.keys(errors).length ? errors : null);
                    }
                }
            }
        });
    }

    // Calculate age from birth date
    calculateAge(birthDate: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Save the user data
    async savedemande() {
        if (this.UserForm.invalid) {
            this.showAlertMessage('error', 'Please fix all validation errors before submitting.');
            return;
        }

        this.user = this.UserForm.value;

        // Add phoneNumber, address, age, and birthDate to the attributes
        this.user.attributes = {
            phoneNumber: [this.UserForm.value.phoneNumber],
            address: [this.UserForm.value.address],
            age: [this.UserForm.get('age')?.value?.toString()], // Get the calculated age
            birthDate: [this.UserForm.value.birthDate?.toISOString().split('T')[0]], // Format as YYYY-MM-DD
            avatar:[this.UserForm.value.avatar]
        };
        const role = this.UserForm.value.role; // Get the selected role

        try {
            // First check if username or email already exists
            await this.validateUniqueFields(this.user.username, this.user.email);
            
            const data = await this.userservice.createUser2(this.user,role).toPromise();
            console.log('User created:', data);
            this.showAlertMessage('success', 'User created successfully!');
            this.goToUserList();
        } catch (error) {
            console.error('Error creating user:', error);
            console.log('Error object keys:', Object.keys(error));
            console.log('Error.error:', error.error);
            console.log('Error.error type:', typeof error.error);
            
            // Handle specific error types
            let errorMessage = 'Failed to create user. Please check your information and try again.';
            
            // Try to parse the error message from different possible locations
            if (error.error) {
                console.log('Error.error content:', error.error);
                
                // If error.error is a string, try to parse it as JSON
                if (typeof error.error === 'string') {
                    try {
                        const parsedError = JSON.parse(error.error);
                        console.log('Parsed error:', parsedError);
                        if (parsedError.errorMessage && parsedError.errorMessage.includes('User exists with same username')) {
                            errorMessage = 'Username already exists. Please choose a different username.';
                        }
                    } catch (parseError) {
                        console.log('Could not parse error as JSON:', parseError);
                        // Check if the string directly contains the error message
                        if (error.error.includes('User exists with same username')) {
                            errorMessage = 'Username already exists. Please choose a different username.';
                        } else if (error.error.includes('email') || error.error.includes('Email')) {
                            errorMessage = 'Email address already exists. Please use a different email.';
                        }
                    }
                } else if (typeof error.error === 'object') {
                    // Handle object format
                    if (error.error.error && error.error.error.includes('User exists with same username')) {
                        errorMessage = 'Username already exists. Please choose a different username.';
                    } else if (error.error.errorMessage && error.error.errorMessage.includes('User exists with same username')) {
                        errorMessage = 'Username already exists. Please choose a different username.';
                    } else if (error.error.message) {
                        if (error.error.message.includes('username') || error.error.message.includes('Username')) {
                            errorMessage = 'Username already exists. Please choose a different username.';
                        } else if (error.error.message.includes('email') || error.error.message.includes('Email')) {
                            errorMessage = 'Email address already exists. Please use a different email.';
                        } else {
                            errorMessage = `Error: ${error.error.message}`;
                        }
                    }
                }
            } else if (error.message) {
                // Handle custom thrown errors (like from validateUniqueFields)
                errorMessage = error.message;
            }
            
            console.log('Final error message:', errorMessage);
            this.showAlertMessage('error', errorMessage);
        }
    }

    // Validate unique fields (username and email)
    async validateUniqueFields(username: string, email: string): Promise<void> {
        try {
            // Check if email already exists
            await this.userservice.getUserByEmail(email).toPromise();
            throw new Error('Email address already exists. Please use a different email.');
        } catch (emailError) {
            // If getUserByEmail throws an error, it means email doesn't exist (which is good)
            if (emailError.message && emailError.message.includes('already exists')) {
                throw emailError;
            }
            // If it's a 404 or similar error, email is available - continue
            console.log('Email is available:', email);
        }

        // Note: Username uniqueness will be caught by the main createUser2 call
        // since the backend validates it and returns the specific error message
    }

    // Show alert message
    showAlertMessage(type: string, message: string) {
        this.alert.type = type;
        this.alert.message = message;
        this.showAlert = true;

        // Hide the alert after a few seconds
        setTimeout(() => {
            this.showAlert = false;
        }, 5000);
    }

    // Navigate to user list after successful creation
    goToUserList() {
        this.router.navigate(['User/dashboard/show-users']);
    }

    // Trigger user creation when form is valid
    onSubmit() {
        if (this.UserForm.valid) {
            this.savedemande();
        } else {
            console.log('Form is invalid');
            this.showAlertMessage('error', 'Please fill all required fields correctly.');
        }
    }


    selectAvatar(avatar: string) {


        this.UserForm.get('avatar')?.setValue(avatar);
        this.image = avatar;

    }
}
