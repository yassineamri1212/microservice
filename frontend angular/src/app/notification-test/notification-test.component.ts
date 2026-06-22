import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NotificationserviceService, NotificationType } from '../notificationservice.service';
import { UsernotificationComponent } from '../usernotification/usernotification.component';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, UsernotificationComponent],
  template: `
    <div class="test-container" style="padding: 20px;">
      <mat-card style="margin-bottom: 20px;">
        <mat-card-header>
          <mat-card-title>Notification System Test</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Current User Email:</strong> {{ currentUserEmail || 'Not found' }}</p>
          <p><strong>WebSocket Status:</strong> {{ webSocketStatus }}</p>
          
          <div style="margin: 20px 0;">
            <button mat-raised-button color="primary" (click)="testConnection()" style="margin-right: 10px;">
              Test WebSocket Connection
            </button>
            <button mat-raised-button color="accent" (click)="loadNotifications()" style="margin-right: 10px;">
              Load Notifications
            </button>
            <button mat-raised-button (click)="createTestNotification()">
              Create Test Notification
            </button>
          </div>
          
          <div style="margin: 20px 0;">
            <h4>Test Notifications:</h4>
            <button mat-button (click)="createInfoNotification()" style="margin-right: 10px;">Info</button>
            <button mat-button (click)="createSuccessNotification()" style="margin-right: 10px;">Success</button>
            <button mat-button (click)="createWarningNotification()" style="margin-right: 10px;">Warning</button>
            <button mat-button (click)="createErrorNotification()">Error</button>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Notification Component -->
      <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
        <app-usernotification></app-usernotification>
      </div>
      
      <!-- Debug Info -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Debug Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <pre>{{ debugInfo | json }}</pre>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class NotificationTestComponent implements OnInit {
  currentUserEmail: string = '';
  webSocketStatus: string = 'Disconnected';
  debugInfo: any = {};

  constructor(private notificationService: NotificationserviceService) {}

  ngOnInit(): void {
    this.currentUserEmail = this.notificationService.getCurrentUserEmail();
    this.updateDebugInfo();
    
    // Set a test email if none exists
    if (!this.currentUserEmail) {
      const testEmail = 'test@example.com';
      sessionStorage.setItem('email', testEmail);
      this.currentUserEmail = testEmail;
      console.log('Set test email:', testEmail);
    }
  }

  testConnection(): void {
    console.log('Testing WebSocket connection...');
    this.notificationService.connect();
    this.webSocketStatus = 'Connecting...';
    
    setTimeout(() => {
      this.webSocketStatus = 'Check console for connection status';
    }, 2000);
  }

  loadNotifications(): void {
    console.log('Loading notifications...');
    this.notificationService.loadUserNotifications();
    this.updateDebugInfo();
  }

  createTestNotification(): void {
    if (!this.currentUserEmail) {
      console.error('No user email available');
      return;
    }

    this.notificationService.createNotificationForCurrentUser(
      'Test Notification',
      'This is a test notification created at ' + new Date().toLocaleTimeString(),
      NotificationType.INFO
    ).subscribe({
      next: (notification) => {
        console.log('Test notification created:', notification);
        this.updateDebugInfo();
      },
      error: (error) => {
        console.error('Error creating test notification:', error);
      }
    });
  }

  createInfoNotification(): void {
    this.notificationService.createNotificationForCurrentUser(
      'Information',
      'This is an info notification',
      NotificationType.INFO
    ).subscribe();
  }

  createSuccessNotification(): void {
    this.notificationService.createNotificationForCurrentUser(
      'Success!',
      'Operation completed successfully',
      NotificationType.SUCCESS
    ).subscribe();
  }

  createWarningNotification(): void {
    this.notificationService.createNotificationForCurrentUser(
      'Warning',
      'Please check your settings',
      NotificationType.WARNING
    ).subscribe();
  }

  createErrorNotification(): void {
    this.notificationService.createNotificationForCurrentUser(
      'Error',
      'Something went wrong',
      NotificationType.ERROR
    ).subscribe();
  }

  private updateDebugInfo(): void {
    this.debugInfo = {
      userEmail: this.currentUserEmail,
      sessionStorageEmail: sessionStorage.getItem('email'),
      isUserLoggedIn: this.notificationService.isUserLoggedIn(),
      timestamp: new Date().toISOString()
    };
  }
}
