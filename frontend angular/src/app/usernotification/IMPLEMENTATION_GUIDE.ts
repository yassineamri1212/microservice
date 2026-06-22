// Example usage of the notification system with email-based WebSocket

/*
NOTIFICATION SYSTEM USAGE

1. The notification service automatically:
   ✅ Gets user email from sessionStorage.getItem('email')
   ✅ Connects to WebSocket: wss://stb-stages.com/notification-service/ws
   ✅ Subscribes to: /topic/notifications/{userEmail}
   ✅ Handles real-time notifications via WebSocket

2. Simply add the component to your template:
*/

// In any component template:
/*
<app-usernotification></app-usernotification>
*/

// Or with specific email override:
/*
<app-usernotification [recipientEmail]="specificEmail"></app-usernotification>
*/

/*
3. To create notifications programmatically:
*/

import { Component } from '@angular/core';
import { NotificationserviceService, NotificationType } from '../notificationservice.service';
import { UsernotificationComponent } from '../usernotification/usernotification.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UsernotificationComponent],
  template: `
    <div class="header">
      <h1>My Application</h1>
      
      <!-- Notification bell - auto-detects user email from session storage -->
      <app-usernotification></app-usernotification>
      
      <!-- Test buttons -->
      <button (click)="createTestNotification()">Create Test Notification</button>
      <button (click)="createSuccessNotification()">Create Success</button>
      <button (click)="createWarningNotification()">Create Warning</button>
      <button (click)="createErrorNotification()">Create Error</button>
    </div>
  `
})
export class ExampleComponent {
  
  constructor(private notificationService: NotificationserviceService) {}

  createTestNotification() {
    this.notificationService.createNotificationForCurrentUser(
      'Test Notification',
      'This is a test notification for the current user',
      NotificationType.INFO
    ).subscribe({
      next: (notification) => {
        console.log('Notification created:', notification);
      },
      error: (error) => {
        console.error('Error creating notification:', error);
      }
    });
  }

  createSuccessNotification() {
    this.notificationService.createNotificationForCurrentUser(
      'Success!',
      'Operation completed successfully',
      NotificationType.SUCCESS
    ).subscribe();
  }

  createWarningNotification() {
    this.notificationService.createNotificationForCurrentUser(
      'Warning',
      'Please check your settings',
      NotificationType.WARNING
    ).subscribe();
  }

  createErrorNotification() {
    this.notificationService.createNotificationForCurrentUser(
      'Error',
      'Something went wrong',
      NotificationType.ERROR
    ).subscribe();
  }
}

/*
4. Session Storage Setup:
   Make sure you have the user email in session storage:
   
   sessionStorage.setItem('email', 'user@example.com');

5. WebSocket Features:
   ✅ Real-time notifications
   ✅ Auto-reconnection
   ✅ Topic subscription per user email
   ✅ Message handling and UI updates

6. Component Features:
   ✅ Bell icon with unread badge
   ✅ Dropdown menu with notification list
   ✅ Mark as read functionality
   ✅ Delete notifications
   ✅ Mark all as read
   ✅ Color-coded notification types
   ✅ Relative time display

7. Backend Integration:
   The service connects to your notification-service backend:
   - HTTP API: https://stb-stages.com/notification-service/api/notifications
   - WebSocket: wss://stb-stages.com/notification-service/ws
   - Topic: /topic/notifications/{userEmail}
*/
