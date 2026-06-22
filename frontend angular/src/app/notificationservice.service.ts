import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Notification {
    id: number;
    user_id: string;
    type: string;           // CHAT_MESSAGE | MEETING_SCHEDULED
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    extra?: Record<string, any>;
}

// Alias kept for component compatibility
export type NotificationResponse = Notification;

export enum NotificationType {
    CHAT_MESSAGE       = 'CHAT_MESSAGE',
    MEETING_SCHEDULED  = 'MEETING_SCHEDULED',
    INFO               = 'INFO',
    SUCCESS            = 'SUCCESS',
    WARNING            = 'WARNING',
    ERROR              = 'ERROR',
}

@Injectable({
    providedIn: 'root'
})
export class NotificationserviceService {

    private readonly baseUrl = 'http://localhost:8090/api/notifications';

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private unreadCountSubject   = new BehaviorSubject<number>(0);

    public notifications$ = this.notificationsSubject.asObservable();
    public unreadCount$   = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient) {}

    // ── HTTP methods ──────────────────────────────────────────────────────────

    getNotifications(userId: string): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.baseUrl}/${userId}`);
    }

    getUnreadNotifications(userId: string): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.baseUrl}/${userId}/unread`);
    }

    markAsRead(id: number): Observable<Notification> {
        return this.http.put<Notification>(`${this.baseUrl}/${id}/read`, {}).pipe(
            tap(() => {
                const updated = this.notificationsSubject.value.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                );
                this.notificationsSubject.next(updated);
                this._refreshUnreadCount(updated);
            })
        );
    }

    markAllAsRead(userId?: string): Observable<any> {
        const uid = userId || this._getUserId();
        const unread = this.notificationsSubject.value.filter(n => !n.is_read);
        unread.forEach(n => this.markAsRead(n.id).subscribe());
        return of({ success: true });
    }

    deleteNotification(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`).pipe(
            tap(() => {
                const updated = this.notificationsSubject.value.filter(n => n.id !== id);
                this.notificationsSubject.next(updated);
                this._refreshUnreadCount(updated);
            })
        );
    }

    // ── State helpers ─────────────────────────────────────────────────────────

    loadUserNotifications(userId?: string): void {
        const uid = userId || this._getUserId();
        if (!uid) return;

        this.getNotifications(uid).subscribe({
            next: (list) => {
                this.notificationsSubject.next(list);
                this._refreshUnreadCount(list);
            },
            error: () => {
                this.notificationsSubject.next([]);
                this.unreadCountSubject.next(0);
            }
        });
    }

    initializeNotificationsForCurrentUser(): void {
        const uid = this._getUserId();
        if (uid) this.loadUserNotifications(uid);
    }

    // No-ops kept for component compatibility (WebSocket removed — RabbitMQ handles events)
    connect(): void {}
    disconnect(): void {}

    getCurrentUserEmail(): string {
        return sessionStorage.getItem('email') || '';
    }

    isUserLoggedIn(): boolean {
        return this.getCurrentUserEmail() !== '';
    }

    private _getUserId(): string {
        return sessionStorage.getItem('userId') || sessionStorage.getItem('email') || '';
    }

    private _refreshUnreadCount(list: Notification[]): void {
        this.unreadCountSubject.next(list.filter(n => !n.is_read).length);
    }
}
