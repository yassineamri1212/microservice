import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationserviceService, Notification, NotificationType } from '../notificationservice.service';
type NotificationResponse = Notification;

@Component({
  selector: 'app-usernotification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './usernotification.component.html',
  styleUrl: './usernotification.component.scss'
})
export class UsernotificationComponent implements OnInit, OnDestroy {
    @Input() recipientEmail: string = '';
    
    notifications$: Observable<NotificationResponse[]>;
    unreadCount$: Observable<number>;
    
    private destroy$ = new Subject<void>();
    private currentUserEmail: string = '';

    constructor(private notificationService: NotificationserviceService) {
        this.notifications$ = this.notificationService.notifications$;
        this.unreadCount$ = this.notificationService.unreadCount$;
    }

    ngOnInit(): void {
        // Get user email from session storage if not provided as input
        this.currentUserEmail = this.recipientEmail || this.getUserEmailFromSessionStorage();
        
        if (this.currentUserEmail) {
            console.log(`Initializing notifications for user: ${this.currentUserEmail}`);
            // Initialize notifications for current user
            this.notificationService.initializeNotificationsForCurrentUser();
        } else {
            console.warn('No user email found in session storage or provided as input');
        }
    }

    private getUserEmailFromSessionStorage(): string {
        return sessionStorage.getItem('email') || '';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.notificationService.disconnect();
    }

    markAsRead(notification: NotificationResponse): void {
        if (notification.id && !notification.is_read) {
            this.notificationService.markAsRead(notification.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log('Notification marked as read');
                        // Reload notifications to update the UI
                        this.notificationService.loadUserNotifications(this.currentUserEmail);
                    },
                    error: (error) => {
                        console.error('Error marking notification as read:', error);
                    }
                });
        }
    }

    deleteNotification(notification: NotificationResponse): void {
        if (notification.id) {
            this.notificationService.deleteNotification(notification.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log('Notification deleted');
                        // Reload notifications to update the UI
                        this.notificationService.loadUserNotifications(this.currentUserEmail);
                    },
                    error: (error) => {
                        console.error('Error deleting notification:', error);
                    }
                });
        }
    }

    markAllAsRead(): void {
        if (this.currentUserEmail) {
            this.notificationService.markAllAsRead(this.currentUserEmail)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log('All notifications marked as read');
                        // Reload notifications to update the UI
                        this.notificationService.loadUserNotifications(this.currentUserEmail);
                    },
                    error: (error) => {
                        console.error('Error marking all notifications as read:', error);
                    }
                });
        }
    }

    getNotificationIcon(type: NotificationType): string {
        switch (type) {
            case NotificationType.SUCCESS:
                return 'check_circle';
            case NotificationType.ERROR:
                return 'error';
            case NotificationType.WARNING:
                return 'warning';
            case NotificationType.INFO:
            default:
                return 'info';
        }
    }

    getNotificationColor(type: NotificationType): string {
        switch (type) {
            case NotificationType.SUCCESS:
                return 'text-green-600';
            case NotificationType.ERROR:
                return 'text-red-600';
            case NotificationType.WARNING:
                return 'text-yellow-600';
            case NotificationType.INFO:
            default:
                return 'text-blue-600';
        }
    }

    formatDate(date: Date): string {
        const notificationDate = new Date(date);
        
        // Format as: "Sep 12, 2025 2:30 PM"
        return notificationDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}
