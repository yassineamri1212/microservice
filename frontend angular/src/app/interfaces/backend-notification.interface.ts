export interface BackendNotification {
    id?: number;
    recipientId: string;
    title: string;
    message: string;
    type: BackendNotificationType;
    read: boolean;
    createdAt?: Date;
}

export enum BackendNotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS'
}

export interface BackendNotificationCreateRequest {
    recipientId: string;
    title: string;
    message: string;
    type: BackendNotificationType;
}

export interface BackendNotificationResponse {
    id: number;
    recipientId: string;
    title: string;
    message: string;
    type: BackendNotificationType;
    read: boolean;
    createdAt: Date;
}

export interface WebSocketMessage {
    type: string;
    notification: BackendNotificationResponse;
}
