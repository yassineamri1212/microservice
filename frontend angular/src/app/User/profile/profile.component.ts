import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSlideToggleModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    user = {
        name: sessionStorage.getItem('username') || 'User Name',
        email: sessionStorage.getItem('email') || 'user@example.com',
        phoneNumber: sessionStorage.getItem('phoneNumber') || 'Not provided',
        address: sessionStorage.getItem('address') || 'Not provided',
        avatar: sessionStorage.getItem('avatar') || 'https://via.placeholder.com/120x120/667eea/ffffff?text=U',
        role: sessionStorage.getItem('role') || 'User',
        memberSince: '2024',
        status: 'Active'
    };

    // Profile statistics
    profileStats = {
        completion: 85,
        securityScore: 'High',
        notifications: 3
    };

    // Settings configuration
    accountSettings = {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        twoFactorAuth: true
    };

    constructor(private router: Router) {}

    ngOnInit(): void {
        // Initialize component data
        this.loadUserProfile();
    }

    private loadUserProfile(): void {
        // Here, you would normally fetch the user data from an API
        // For now, we're using sessionStorage data
        console.log('Profile loaded for user:', this.user.name);
    }

    editProfile(): void {
        // Redirect to the edit profile page
        this.router.navigate(['User/edituser']);
    }

    editAvatar(): void {
        // Handle avatar edit functionality
        console.log('Edit avatar clicked');
        // You could open a file picker or modal here
    }

    changePassword(): void {
        // Navigate to change password page
        console.log('Change password clicked');
        // this.router.navigate(['User/change-password']);
    }

    managePrivacy(): void {
        // Navigate to privacy settings
        console.log('Manage privacy clicked');
        // this.router.navigate(['User/privacy-settings']);
    }

    downloadData(): void {
        // Handle data download
        console.log('Download data clicked');
        // Implement data export functionality
    }

    deleteAccount(): void {
        // Handle account deletion
        console.log('Delete account clicked');
        // Show confirmation dialog and handle deletion
    }

    onSettingChange(setting: string, value: boolean): void {
        // Handle setting changes
        console.log(`Setting ${setting} changed to:`, value);

        // Update the setting
        switch(setting) {
            case 'emailNotifications':
                this.accountSettings.emailNotifications = value;
                break;
            case 'smsNotifications':
                this.accountSettings.smsNotifications = value;
                break;
            case 'marketingEmails':
                this.accountSettings.marketingEmails = value;
                break;
            case 'twoFactorAuth':
                this.accountSettings.twoFactorAuth = value;
                break;
        }

        // Here you would typically save to backend
        this.saveSettings();
    }

    private saveSettings(): void {
        // Save settings to backend
        console.log('Saving settings:', this.accountSettings);
        // Implement API call to save settings
    }

    getCompletionColor(): string {
        if (this.profileStats.completion >= 80) return '#10b981';
        if (this.profileStats.completion >= 60) return '#f59e0b';
        return '#ef4444';
    }

    getSecurityIcon(): string {
        switch(this.profileStats.securityScore) {
            case 'High': return 'shield';
            case 'Medium': return 'security';
            default: return 'warning';
        }
    }
}
