import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatSnackBarModule, MatSnackBar} from "@angular/material/snack-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDividerModule} from "@angular/material/divider";
import {TextFieldModule} from "@angular/cdk/text-field";
import {Usertype} from "../../Model/usertype";
import {UserService} from "../../user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../core/auth/auth.service";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'app-edituser',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatIconModule, 
    MatInputModule, 
    ReactiveFormsModule, 
    TextFieldModule, 
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './edituser.component.html',
  styleUrl: './edituser.component.scss'
})
export class EdituserComponent {
  user: Usertype = new Usertype();
  id!: string;
  image: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;
  isValidatingEmail: boolean = false;
  
  UserForm = new FormGroup({
    username: new FormControl({value: '', disabled: true}, [Validators.required, Validators.minLength(3)]), // Disabled to prevent updates
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]),
    avatar: new FormControl(''),
    adresse: new FormControl('')
  });
  
  avatars = ['avatar1.jpg', 'avatar2.jpg', 'male.png', 'female1.png', 'female2.png', 'female3.png'];
  
  constructor(
    private userservice: UserService,
    private router: Router,
    private authservice: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    console.log(this.authservice.accessToken);
    this.loadUserData();
  }

  private loadUserData(): void {
    this.isLoading = true;
    this.id = sessionStorage.getItem("userId") || '';
    
    if (!this.id) {
      this.showError('User ID not found');
      this.router.navigate(['/login']);
      return;
    }

    this.user.id = String(this.id);
    
    this.userservice.getuserById2(this.id).subscribe({
      next: (data) => {
        this.user = data;
        const phoneNumber = Array.isArray(this.user.attributes.phoneNumber) 
          ? this.user.attributes.phoneNumber.join(', ') 
          : this.user.attributes.phoneNumber;
        const address = Array.isArray(this.user.attributes.address) 
          ? this.user.attributes.address.join(', ') 
          : this.user.attributes.address;
        const avatar = Array.isArray(this.user.attributes.avatar) 
          ? this.user.attributes.avatar.join(', ') 
          : this.user.attributes.avatar;
        
        this.image = avatar || 'male.png';
        
        this.UserForm.patchValue({
          username: this.user.username,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          avatar: avatar,
          phoneNumber: phoneNumber,
          adresse: address,
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.showError('Failed to load user data');
        this.isLoading = false;
      }
    });
  }
  savedemande(): void {
    if (this.UserForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSaving = true;
    
    const newEmail = this.UserForm.get('email')?.getRawValue();
    const currentEmail = this.user.email;
    
    // Check if email has changed and validate uniqueness
    if (newEmail !== currentEmail) {
      this.isValidatingEmail = true;
      this.validateEmailUniqueness(newEmail).then((isUnique) => {
        this.isValidatingEmail = false;
        if (isUnique) {
          this.proceedWithUpdate();
        } else {
          this.showError('Email address already exists. Please use a different email.');
          this.isSaving = false;
        }
      }).catch((error) => {
        this.isValidatingEmail = false;
        console.error('Error validating email uniqueness:', error);
        this.showError('Failed to validate email. Please try again.');
        this.isSaving = false;
      });
    } else {
      // Email hasn't changed, proceed with update
      this.proceedWithUpdate();
    }
  }

  private async validateEmailUniqueness(email: string): Promise<boolean> {
    try {
      // Try to get user by email - if it succeeds, email exists
      await this.userservice.getUserByEmail(email).toPromise();
      return false; // Email exists
    } catch (error) {
      // If error occurs (like 404), email doesn't exist - which is what we want
      return true; // Email is available
    }
  }

  private proceedWithUpdate(): void {
    // Don't update username - keep the original value
    // this.user.username = this.UserForm.get('username')?.getRawValue(); // Commented out to prevent username updates
    this.user.firstName = this.UserForm.get('firstName')?.getRawValue();
    this.user.lastName = this.UserForm.get('lastName')?.getRawValue();
    this.user.email = this.UserForm.get('email')?.getRawValue();
    
    this.user.attributes = {
      ...this.user.attributes,
      phoneNumber: [this.UserForm.get('phoneNumber')?.getRawValue() || ''],
      address: [this.UserForm.get('adresse')?.getRawValue() || ''],
      avatar: [this.UserForm.get('avatar')?.getRawValue() || 'male.png'],
    };

    this.userservice.updateuser(this.user, String(this.id)).subscribe({
      next: (data) => {
        // Update session storage (excluding username to prevent changes)
        sessionStorage.setItem('firstName', this.user.firstName);
        // sessionStorage.setItem('username', this.user.username); // Commented out to prevent username updates
        sessionStorage.setItem('email', this.user.email);
        
        if (this.user.attributes) {
          const phoneNumber = Array.isArray(this.user.attributes.phoneNumber) 
            ? this.user.attributes.phoneNumber.join(', ') 
            : this.user.attributes.phoneNumber;
          const address = Array.isArray(this.user.attributes.address) 
            ? this.user.attributes.address.join(', ') 
            : this.user.attributes.address;
          const avatar = Array.isArray(this.user.attributes.avatar) 
            ? this.user.attributes.avatar.join(', ') 
            : this.user.attributes.avatar;

          sessionStorage.setItem('avatar', avatar || '');
          sessionStorage.setItem('phoneNumber', phoneNumber || '');
          sessionStorage.setItem('address', address || '');
        }
        
        this.showSuccess('Profile updated successfully!');
        this.isSaving = false;
        
        // Navigate after a short delay to show the success message
        setTimeout(() => {
          this.goToUserList();
        }, 1500);
      },
      error: (error) => {
        console.log(error);
        this.showError('Failed to update profile. Please try again.');
        this.isSaving = false;
      }
    });
  }


  goToUserList(): void {
    this.router.navigate(['profile']);
  }

  onSubmit(): void {
    console.log(this.user);
    this.savedemande();
  }

  selectAvatar(avatar: string): void {
    this.UserForm.get('avatar')?.setValue(avatar);
    this.image = avatar;
  }

  // Utility methods
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.UserForm.controls).forEach(key => {
      const control = this.UserForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for template validation
  get username() { return this.UserForm.get('username'); }
  get firstName() { return this.UserForm.get('firstName'); }
  get lastName() { return this.UserForm.get('lastName'); }
  get email() { return this.UserForm.get('email'); }
  get phoneNumber() { return this.UserForm.get('phoneNumber'); }
  get address() { return this.UserForm.get('adresse'); }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const field = this.UserForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (field?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }
}
