import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { Usertype } from '../Model/usertype';

@Component({
  selector: 'app-adduser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adduser.component.html',
  styleUrl: './adduser.component.scss'
})
export class AddUserComponent implements OnInit {

  // Form data
  userForm = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    birthDate: '' as string, // HTML date input returns string
    age: 0,
    avatar: '',
    role: '' // Will be determined based on current user's role
  };

  // Available avatars
  avatars: string[] = [
    'avatar1.jpg',
    'avatar2.jpg',
    'male.png',
    'female1.png',
    'female2.png',
    'female3.png'
  ];

  // Date picker properties
  maxDate: Date;
  minDate: Date;

  // Component state
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  currentUserRole: string = '';
  targetRole: string = '';
  componentTitle: string = '';
  image: string = ''; // For avatar preview

  // Field-specific validation errors
  fieldErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    birthDate: '',
    avatar: ''
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    // Set date constraints
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // Must be at least 18
    this.minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()); // Max 100 years old
  }

  ngOnInit(): void {
    this.initializeRoleBasedSettings();
  }

  // Initialize role-based settings
  private initializeRoleBasedSettings(): void {
    // Get current user role from session storage
    const rolesString = sessionStorage.getItem('roles');

    if (rolesString) {
      try {
        const resourceAccess = JSON.parse(rolesString);
        const roles = resourceAccess.angular?.roles || [];

        // Determine target role and component title based on current user roles
        if (roles.includes('bank_officer')) {
          this.currentUserRole = 'bank_officer';
          this.targetRole = 'bank_agent';
          this.componentTitle = 'Add Bank Agent';
          this.userForm.role = 'bank_agent';
        } else if (roles.includes('cnss_officer')) {
          this.currentUserRole = 'cnss_officer';
          this.targetRole = 'cnss_agent';
          this.componentTitle = 'Add CNSS Agent';
          this.userForm.role = 'cnss_agent';
        } else {
          // Unauthorized access
          this.error = 'You are not authorized to add users. Only officers can add agents.';
          console.error('Unauthorized access attempt by roles:', roles);
        }

        console.log('Current user roles:', roles);
        console.log('Target role for new user:', this.targetRole);

      } catch (error) {
        console.error('Error parsing roles from session storage:', error);
        this.error = 'Error determining user permissions. Please log in again.';
      }
    } else {
      this.error = 'No user session found. Please log in.';
      console.error('No roles found in session storage');
    }
  }

  // Real-time field validation
  validateUsername(): void {
    if (!this.userForm.username || !this.userForm.username.trim()) {
      this.fieldErrors.username = 'Username is required';
    } else if (this.userForm.username.trim().length < 3) {
      this.fieldErrors.username = 'Username must be at least 3 characters';
    } else {
      this.fieldErrors.username = '';
    }
  }

  validateEmail(): void {
    if (!this.userForm.email || !this.userForm.email.trim()) {
      this.fieldErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.userForm.email)) {
        this.fieldErrors.email = 'Please enter a valid email address';
      } else {
        this.fieldErrors.email = '';
      }
    }
  }

  validatePassword(): void {
    if (!this.userForm.password || !this.userForm.password.trim()) {
      this.fieldErrors.password = 'Password is required';
    } else if (this.userForm.password.length < 6) {
      this.fieldErrors.password = 'Password must be at least 6 characters';
    } else {
      this.fieldErrors.password = '';
    }
    // Also revalidate confirm password when password changes
    this.validateConfirmPassword();
  }

  validateConfirmPassword(): void {
    if (!this.userForm.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Please confirm your password';
    } else if (this.userForm.password !== this.userForm.confirmPassword) {
      this.fieldErrors.confirmPassword = 'Passwords do not match';
    } else {
      this.fieldErrors.confirmPassword = '';
    }
  }

  validateFirstName(): void {
    if (!this.userForm.firstName || !this.userForm.firstName.trim()) {
      this.fieldErrors.firstName = 'First name is required';
    } else {
      this.fieldErrors.firstName = '';
    }
  }

  validateLastName(): void {
    if (!this.userForm.lastName || !this.userForm.lastName.trim()) {
      this.fieldErrors.lastName = 'Last name is required';
    } else {
      this.fieldErrors.lastName = '';
    }
  }

  validatePhoneNumber(): void {
    if (this.userForm.phoneNumber && this.userForm.phoneNumber.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(this.userForm.phoneNumber)) {
        this.fieldErrors.phoneNumber = 'Please enter a valid phone number';
      } else {
        this.fieldErrors.phoneNumber = '';
      }
    } else {
      this.fieldErrors.phoneNumber = '';
    }
  }

  validateAddress(): void {
    // Address is optional, no validation needed unless you want to enforce it
    this.fieldErrors.address = '';
  }

  validateBirthDate(): void {
    if (!this.userForm.birthDate) {
      this.fieldErrors.birthDate = 'Birth date is required';
    } else {
      const age = this.calculateAge(this.userForm.birthDate);
      if (age < 18) {
        this.fieldErrors.birthDate = 'User must be at least 18 years old';
      } else {
        this.fieldErrors.birthDate = '';
        this.userForm.age = age; // Update calculated age automatically
      }
    }
  }

  // Handle birth date change (same as sign-up component)
  onBirthDateChange(): void {
    if (this.userForm.birthDate) {
      const age = this.calculateAge(this.userForm.birthDate);
      this.userForm.age = age;

      // Validate age is at least 18
      if (age < 18) {
        this.fieldErrors.birthDate = 'User must be at least 18 years old';
      } else {
        this.fieldErrors.birthDate = '';
      }
    } else {
      this.userForm.age = 0;
      this.fieldErrors.birthDate = 'Birth date is required';
    }
  }

  validateAvatar(): void {
    if (!this.userForm.avatar) {
      this.fieldErrors.avatar = 'Please select an avatar';
    } else {
      this.fieldErrors.avatar = '';
    }
  }

  // Calculate age from birth date
  calculateAge(birthDate: Date | string): number {
    // Convert string to Date if needed
    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

    // Check if date is valid
    if (!birthDateObj || isNaN(birthDateObj.getTime())) {
      return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    return age;
  }

  // Check if form is valid
  isFormValid(): boolean {
    return this.fieldErrors.username === '' &&
           this.fieldErrors.email === '' &&
           this.fieldErrors.password === '' &&
           this.fieldErrors.confirmPassword === '' &&
           this.fieldErrors.firstName === '' &&
           this.fieldErrors.lastName === '' &&
           this.fieldErrors.phoneNumber === '' &&
           this.fieldErrors.address === '' &&
           this.fieldErrors.birthDate === '' &&
           this.fieldErrors.avatar === '' &&
           !!this.userForm.username?.trim() &&
           !!this.userForm.email?.trim() &&
           !!this.userForm.password?.trim() &&
           !!this.userForm.firstName?.trim() &&
           !!this.userForm.lastName?.trim() &&
           !!this.userForm.birthDate &&
           !!this.userForm.avatar;
  }

  // Validate form data
  private validateForm(): boolean {
    // Trigger all field validations
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();
    this.validateFirstName();
    this.validateLastName();
    this.validatePhoneNumber();
    this.validateAddress();
    this.onBirthDateChange(); // Use the new method that handles age calculation
    this.validateAvatar();

    // Check if form is valid
    if (!this.isFormValid()) {
      this.error = 'Please fix the highlighted errors below';
      return false;
    }

    this.error = null;
    return true;
  }

  // Create new user
  createUser(): void {
    if (!this.validateForm()) {
      return;
    }

    // Check if user is authorized to create users
    if (!this.targetRole) {
      this.error = 'You are not authorized to create users';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Prepare user data using Usertype model
    const newUser = new Usertype();
    newUser.username = this.userForm.username.trim();
    newUser.email = this.userForm.email.trim();
    newUser.firstName = this.userForm.firstName.trim();
    newUser.lastName = this.userForm.lastName.trim();
    newUser.password = this.userForm.password; // Password is needed for the API URL
    newUser.enabled = true;
    newUser.emailVerified = true;
    newUser.totp = false;
    newUser.createdTimestamp = Date.now();
    newUser.notBefore = 0;

    // Add all additional attributes
    newUser.attributes = {
      phoneNumber: this.userForm.phoneNumber ? [this.userForm.phoneNumber.trim()] : [],
      address: this.userForm.address ? [this.userForm.address.trim()] : [],
      age: [this.userForm.age.toString()],
      birthDate: this.userForm.birthDate ? [this.userForm.birthDate] : [], // birthDate is already a string
      avatar: this.userForm.avatar ? [this.userForm.avatar] : []
    };

    console.log('Creating user with data:', { ...newUser, password: '[HIDDEN]' });

    // Call user service to create user with role
    this.userService.createUser2(newUser, this.targetRole).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.success = `${this.targetRole.replace('_', ' ')} created successfully!`;
        this.resetForm();
        this.loading = false;

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          this.goBack();
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.loading = false;

        if (error.status === 409) {
          this.error = 'Username or email already exists. Please choose different values.';
        } else if (error.status === 400) {
          this.error = 'Invalid user data. Please check all fields and try again.';
        } else if (error.status === 403) {
          this.error = 'You are not authorized to create users.';
        } else {
          this.error = 'Failed to create user. Please try again later.';
        }
      }
    });
  }

  // Reset form to initial state
  private resetForm(): void {
    this.userForm = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      birthDate: null,
      age: 0,
      avatar: '',
      role: this.targetRole
    };
  }

  // Go back to user list
  goBack(): void {
    this.router.navigate(['User/dashboard/show-users']);
  }

  // Get role display name
  getRoleDisplayName(): string {
    return this.targetRole.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Select avatar method (same as sign-up component)
  selectAvatar(avatar: string): void {
    this.userForm.avatar = avatar;
    this.image = avatar;
    this.validateAvatar(); // Trigger validation
  }
}
