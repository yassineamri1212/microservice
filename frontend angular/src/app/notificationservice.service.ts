import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Notification {
    id?: number;
    recipientId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt?: Date;
}

export enum NotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS'
}

export interface NotificationCreateRequest {
    recipientId: string;
    title: string;
    message: string;
    type: NotificationType;
}

// Meeting notification interface for the send API
export interface MeetingNotificationRequest {
    userEmail: string;
    title: string;
    message: string;
    senderEmail: string;
    senderName: string;
    notificationType: string;
    actionUrl?: string;
    icon?: string;
    priority?: string;
}

export interface NotificationResponse {
    id: number;
    recipientId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: Date;
}

export interface WebSocketMessage {
    type: string;
    notification: NotificationResponse;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationserviceService {
    private readonly apiUrl = 'https://stb-stages.com/api/notifications';
    private readonly sendApiUrl = 'https://stb-stages.com/notification-service/api/notifications/send';
    private stompClient: Client;
    private notificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);
    private messageSubject = new Subject<any>();

    public notifications$ = this.notificationsSubject.asObservable();
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient) {
        this.initializeWebSocketConnection();
    }

    // HTTP API Methods
    getNotifications(recipientId: string): Observable<NotificationResponse[]> {
        return this.http.get<any>(`${this.apiUrl}/user/${recipientId}`).pipe(
            map(response => {
                // Backend returns { success: true, notifications: [...] }
                // We need to extract the notifications array
                if (response && response.notifications && Array.isArray(response.notifications)) {
                    return response.notifications;
                }
                return [];
            })
        );
    }

    getUnreadNotifications(recipientId: string): Observable<NotificationResponse[]> {
        return this.http.get<NotificationResponse[]>(`${this.apiUrl}/user/${recipientId}/unread`);
    }

    createNotification(notification: NotificationCreateRequest): Observable<NotificationResponse> {
        return this.http.post<NotificationResponse>(this.apiUrl, notification);
    }

    markAsRead(id: number): Observable<NotificationResponse> {
        return this.http.put<NotificationResponse>(`${this.apiUrl}/${id}/read`, {});
    }

    deleteNotification(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Send meeting notification using the correct API endpoint
    sendMeetingNotification(notification: MeetingNotificationRequest): Observable<any> {
        return this.http.post<any>(this.sendApiUrl, notification);
    }

    // WebSocket Methods
    private initializeWebSocketConnection(): void {
        // Connect to the notification service WebSocket endpoint using SockJS
        this.stompClient = new Client({
            webSocketFactory: () => {
                // Create SockJS without credentials and with specific transports
                const sockjs = new SockJS('https://stb-stages.com/notification-service/ws-notifications', null, {
                    withCredentials: false,
                    transports: ['xhr-polling', 'xhr-streaming'] // Avoid websocket transport that might have CORS issues
                });
                return sockjs;
            },
            connectHeaders: {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (msg: string) => {
                console.log('Notification WebSocket:', msg);
            },
        });

        this.stompClient.onConnect = () => {
            console.log('✅ Connected to Notification WebSocket server');
            // Auto-subscribe for current user when connected
            const userEmail = this.getUserEmailFromSessionStorage();
            if (userEmail) {
                console.log(`Auto-subscribing for user: ${userEmail}`);
                this.subscribeToUserNotifications(userEmail);
            } else {
                console.warn('No user email found in session storage');
            }
        };

        this.stompClient.onStompError = (frame) => {
            console.error('❌ Notification Broker reported error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
        };

        this.stompClient.onWebSocketClose = (event) => {
            console.log('🔌 Notification WebSocket connection closed:', event);
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('⚠️ Notification WebSocket error:', error);
            console.log('Trying alternative WebSocket endpoints...');
            // Try alternative endpoint
            setTimeout(() => {
                this.tryAlternativeConnection();
            }, 2000);
        };
    }

    connect(): void {
        if (!this.stompClient.active) {
            console.log('🔄 Opening Notification WebSocket...');
            this.stompClient.activate();
        }
    }

    disconnect(): void {
        if (this.stompClient.active) {
            this.stompClient.deactivate();
        }
    }

    private tryAlternativeConnection(): void {
        console.log('🔄 Trying alternative WebSocket connection...');
        
        // Disconnect current client
        if (this.stompClient.active) {
            this.stompClient.deactivate();
        }

        // Try with different configuration - pure WebSocket without SockJS
        this.stompClient = new Client({
            brokerURL: 'wss://stb-stages.com/notification-service/ws-notifications-raw',
            connectHeaders: {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (msg: string) => {
                console.log('Alternative WebSocket:', msg);
            },
        });

        // Set up handlers again
        this.setupWebSocketHandlers();
        this.connect();
    }

    private setupWebSocketHandlers(): void {
        this.stompClient.onConnect = () => {
            console.log('✅ Connected to alternative WebSocket endpoint');
            const userEmail = this.getUserEmailFromSessionStorage();
            if (userEmail) {
                this.subscribeToUserNotifications(userEmail);
            }
        };

        this.stompClient.onStompError = (frame) => {
            console.error('❌ Alternative endpoint error:', frame.headers['message']);
        };
    }

    subscribeToUserNotifications(userEmail: string): void {
        if (this.stompClient && this.stompClient.active) {
            console.log(`Subscribing to notifications for: ${userEmail}`);
            this.stompClient.subscribe(`/topic/notifications/${userEmail}`, (message: IMessage) => {
                try {
                    const parsedMessage = JSON.parse(message.body);
                    console.log('Received notification:', parsedMessage);
                    this.handleWebSocketMessage(parsedMessage);
                    this.messageSubject.next(parsedMessage);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
        } else {
            console.error('No STOMP connection found. Cannot subscribe to notifications.');
            // Try to connect and then subscribe
            this.connect();
            setTimeout(() => {
                this.subscribeToUserNotifications(userEmail);
            }, 3000);
        }
    }

    private getUserEmailFromSessionStorage(): string {
        return sessionStorage.getItem('email') || '';
    }

    private handleWebSocketMessage(message: any): void {
        const currentNotifications = this.notificationsSubject.value;
        
        // Ensure currentNotifications is an array
        if (!Array.isArray(currentNotifications)) {
            console.warn('Current notifications is not an array, resetting to empty array');
            this.notificationsSubject.next([]);
            return;
        }
        
        // Check if the message is a direct notification object (from our backend)
        if (message.id && message.userEmail && message.title) {
            console.log('Processing direct notification object');
            // This is a direct notification object, add it to the list
            const updatedNotifications = [message, ...currentNotifications];
            this.notificationsSubject.next(updatedNotifications);
            this.updateUnreadCount(updatedNotifications);
            return;
        }
        
        // Handle structured messages with type property
        switch (message.type) {
            case 'NEW_NOTIFICATION':
                const updatedNotifications = [message.notification, ...currentNotifications];
                this.notificationsSubject.next(updatedNotifications);
                this.updateUnreadCount(updatedNotifications);
                break;
            
            case 'NOTIFICATION_READ':
                const readUpdatedNotifications = currentNotifications.map(notification =>
                    notification.id === message.notification.id 
                        ? { ...notification, isRead: true }
                        : notification
                );
                this.notificationsSubject.next(readUpdatedNotifications);
                this.updateUnreadCount(readUpdatedNotifications);
                break;
            
            case 'NOTIFICATION_DELETED':
                const filteredNotifications = currentNotifications.filter(
                    notification => notification.id !== message.notification.id
                );
                this.notificationsSubject.next(filteredNotifications);
                this.updateUnreadCount(filteredNotifications);
                break;
                
            default:
                console.log('Unknown WebSocket message type:', message.type);
        }
    }

    private updateUnreadCount(notifications: NotificationResponse[]): void {
        // Ensure notifications is an array before using filter
        if (Array.isArray(notifications)) {
            const unreadCount = notifications.filter(notification => !notification.isRead).length;
            this.unreadCountSubject.next(unreadCount);
        } else {
            console.warn('Notifications is not an array:', notifications);
            this.unreadCountSubject.next(0);
        }
    }

    loadUserNotifications(userEmail?: string): void {
        const email = userEmail || this.getUserEmailFromSessionStorage();
        if (email) {
            this.getNotifications(email).subscribe({
                next: (notifications) => {
                    // Ensure we have an array
                    const notificationArray = Array.isArray(notifications) ? notifications : [];
                    this.notificationsSubject.next(notificationArray);
                    this.updateUnreadCount(notificationArray);
                },
                error: (error) => {
                    console.error('Error loading notifications:', error);
                    // Set empty array on error
                    this.notificationsSubject.next([]);
                    this.updateUnreadCount([]);
                }
            });
        }
    }

    markAllAsRead(userEmail?: string): Observable<any> {
        const email = userEmail || this.getUserEmailFromSessionStorage();
        return this.http.put(`${this.apiUrl}/user/${email}/read-all`, {});
    }

    // Helper method to create notification for current user
    createNotificationForCurrentUser(title: string, message: string, type: NotificationType): Observable<NotificationResponse> {
        const currentUserEmail = this.getUserEmailFromSessionStorage();
        
        if (!currentUserEmail) {
            throw new Error('No user email found in session storage');
        }
        
        const notification: NotificationCreateRequest = {
            recipientId: currentUserEmail,
            title,
            message,
            type
        };
        
        return this.createNotification(notification);
    }

    // Get current user email (public method for external use)
    getCurrentUserEmail(): string {
        return this.getUserEmailFromSessionStorage();
    }

    // Check if user is logged in
    isUserLoggedIn(): boolean {
        return this.getUserEmailFromSessionStorage() !== '';
    }

    // Initialize notifications for current user (useful for app initialization)
    initializeNotificationsForCurrentUser(): void {
        const currentUserEmail = this.getUserEmailFromSessionStorage();
        if (currentUserEmail) {
            this.connect();
            this.loadUserNotifications(currentUserEmail);
        }
    }

    getMessages(): Subject<any> {
        return this.messageSubject;
    }
}
