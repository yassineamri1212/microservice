// Example usage of the UsernotificationComponent with automatic user detection from session storage

/*
The component now automatically gets the user ID/email from session storage!

1. First, import the component in your module or standalone component:

import { UsernotificationComponent } from './usernotification/usernotification.component';

2. Add it to your imports array and use in template:

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UsernotificationComponent], // Add this
  template: `
    <div class="header">
      <!-- Other header content -->
      
      <!-- Add the notification component - no recipientId needed! -->
      <app-usernotification></app-usernotification>
      
      <!-- OR optionally override with specific user ID -->
      <app-usernotification [recipientId]="specificUserId"></app-usernotification>
    </div>
  `
})

3. The component automatically looks for user info in session storage from these keys:
   - 'userId', 'user_id', 'id'
   - 'userEmail', 'user_email', 'email' (as fallback)
   - 'user', 'currentUser', 'authUser' (parsed as JSON object)

4. To create notifications, you can now use the simplified method:

constructor(private notificationService: NotificationserviceService) {}

// Easy way - automatically uses current user from session storage
createNotificationEasy() {
  this.notificationService.createNotificationForCurrentUser(
    'Meeting Reminder',
    'You have a meeting scheduled in 30 minutes',
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

// Or the original way with specific recipient
createNotificationSpecific() {
  const newNotification = {
    recipientId: 'user123', // or this.notificationService.getCurrentUserId()
    title: 'Meeting Reminder',
    message: 'You have a meeting scheduled in 30 minutes',
    type: NotificationType.INFO
  };
  
  this.notificationService.createNotification(newNotification).subscribe({
    next: (notification) => {
      console.log('Notification created:', notification);
    },
    error: (error) => {
      console.error('Error creating notification:', error);
    }
  });
}

5. Get current user ID programmatically:
getCurrentUser() {
  const currentUserId = this.notificationService.getCurrentUserId();
  console.log('Current user ID:', currentUserId);
}

6. Session Storage Examples:
   - sessionStorage.setItem('userId', '12345');
   - sessionStorage.setItem('userEmail', 'user@example.com');
   - sessionStorage.setItem('user', JSON.stringify({id: '123', email: 'user@example.com'}));

The component will automatically:
- Detect user from session storage
- Show bell icon with unread count badge
- Display notifications in dropdown menu
- Handle real-time updates via WebSocket
- Allow marking notifications as read/delete
- Show relative time formatting

Available notification types:
- NotificationType.INFO (blue icon)
- NotificationType.SUCCESS (green icon)
- NotificationType.WARNING (yellow icon)
- NotificationType.ERROR (red icon)
*/
