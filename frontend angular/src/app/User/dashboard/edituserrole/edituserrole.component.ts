import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../user.service';
import { Usertype } from '../../../Model/usertype';

@Component({
  selector: 'app-edituserrole',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './edituserrole.component.html',
  styleUrl: './edituserrole.component.scss'
})
export class EdituserroleComponent implements OnInit {
  userId!: string;
  user!: Usertype;
  selectedRole: string = '';

  availableRoles = [
    { value: 'bank_agent', label: 'Bank Agent' },
    { value: 'bank_officer', label: 'Bank Officer' },
    { value: 'cnss_agent', label: 'CNSS Agent' },
    { value: 'cnss_officer', label: 'CNSS Officer' }
  ];

  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading = true;
    this.userService.getuserById2(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.userService.getRolesForUser(user.id).subscribe({
          next: (roles) => {
            if (roles && roles.length > 0) {
              this.selectedRole = roles[0].name;
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading user roles:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.snackBar.open('Error loading user', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  updateRole(): void {
    if (!this.selectedRole) {
      this.snackBar.open('Please select a role', 'Close', { duration: 3000 });
      return;
    }

    console.log('Updating role for user:', this.userId, 'to role:', this.selectedRole);
    this.isLoading = true;

    this.userService.updateUserRole(this.userId, this.selectedRole).subscribe({
      next: (response) => {
        console.log('Role update response:', response);
        const message = response?.message || 'Role updated successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.router.navigate(['/User/dashboard/show-users']);
      },
      error: (error) => {
        console.error('Error updating role:', error);
        let errorMessage = 'Error updating role';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check if the service is running.';
        } else if (error.status === 404) {
          errorMessage = 'User or role not found';
        } else if (error.status === 400) {
          errorMessage = 'Invalid role selected';
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/User/showusers']);
  }
}
