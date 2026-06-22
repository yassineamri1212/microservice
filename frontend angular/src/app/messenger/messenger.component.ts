import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../web-socket-service.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user.service';
import { NotificationserviceService } from '../notificationservice.service';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss'],
    imports: [
        FormsModule,CommonModule,
    ],
    standalone: true
})
export class MessengerComponent implements OnInit, OnDestroy {
    receiverId: number | null = null;
    messageContent: string = '';
    messages: any[] = [];
    users: any[] = [];
    messageSubscription: Subscription;
    private senderId: string = sessionStorage.getItem('userId') || '';

    constructor(
        private webSocketService: WebSocketService,
        private http: HttpClient,
        private userservice: UserService,
        private notificationService: NotificationserviceService
    ) {}

    ngOnInit(): void {
        this.webSocketService.connect();
        this.getUsers();
        this.messageSubscription = this.webSocketService.getMessages().subscribe((message) => {
            console.log('Received message:', message);
            this.handleNewMessage(message);
        });
    }

    ngOnDestroy(): void {
        this.webSocketService.disconnect();
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
    }

    sendMessage(): void {
        if (this.messageContent.trim() === '') {
            console.error('Message content is empty!');
            return;
        }

        // Send WebSocket message
        this.webSocketService.sendMessage(
            '/app/chat.sendMessage',
            this.messageContent,
            this.senderId,
            this.receiverId
        );

        // Send notification to recipient
        this.sendMessageNotification();

        this.messageContent = '';
    }

    private sendMessageNotification(): void {
        if (!this.receiverId) {
            console.error('No recipient selected for notification');
            return;
        }

        // Get recipient user info
        const recipientUser = this.users.find(u => u.id === this.receiverId);
        if (!recipientUser || !recipientUser.email) {
            console.error('Recipient user not found or email missing');
            return;
        }

        // Get sender info from session storage
        const senderEmail = sessionStorage.getItem('email') || 'unknown@stb.com.tn';
        const senderName = sessionStorage.getItem('firstName') + ' ' + sessionStorage.getItem('lastName') || 'Unknown User';

        // Notifications are now sent automatically via RabbitMQ from service-chat
    }

    getUsers(): void {
        this.userservice.getUserList().subscribe((users) => {
            this.users = users;
        });
    }

    selectUser(userId: number): void {
        this.receiverId = userId;
        this.getMessagesBetweenUsers(this.senderId, this.receiverId);
    }

    getMessagesBetweenUsers(senderId: string, receiverId: number): void {
        this.http
            .get<any[]>(`https://stb-stages.com/api/chat/messages/${senderId}/${receiverId}`)
            .subscribe((sentMessages) => {
                this.http
                    .get<any[]>(`https://stb-stages.com/api/chat/messages/${receiverId}/${senderId}`)
                    .subscribe((receivedMessages) => {
                        this.messages = [...sentMessages, ...receivedMessages];
                        this.sortMessagesByTime();
                        this.scrollToBottom();
                    });
            });
    }

    handleNewMessage(message: any): void {
        if (
            (message.receiverId === this.receiverId && message.senderId === this.senderId) ||
            (message.senderId === this.receiverId && message.receiverId === this.senderId)
        ) {
            this.messages.push(message);
            this.sortMessagesByTime();
            this.scrollToBottom();
        }
    }

    sortMessagesByTime(): void {
        this.messages.sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
    }

    scrollToBottom(): void {
        const messageList = document.querySelector('.message-list');
        if (messageList) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    }

    getSelectedUserName(): string {
        const user = this.users.find(u => u.id === this.receiverId);
        return user ? `${user.firstName} ${user.lastName}` : '';
    }

    getSelectedUserInitials(): string {
        const user = this.users.find(u => u.id === this.receiverId);
        if (user) {
            return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
        }
        return '';
    }

    onEnterPressed(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
}
