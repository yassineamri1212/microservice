import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private stompClient: Client;
    private messageSubject = new Subject<any>(); // This will emit messages

    constructor() {
        this.stompClient = new Client({
            brokerURL: 'wss://stb-stages.com/chat/ws',
            reconnectDelay: 5000,
            debug: (msg: string) => {
                console.log(msg);
            },
        });

        this.stompClient.onConnect = () => {
            console.log('Connected to WebSocket server');
            this.subscribe('/topic/messages', (message) => {
                console.log('Received message:', message);
                this.messageSubject.next(message); // Emit the message to the subscribers
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
        };
    }

    connect(): void {
        if (!this.stompClient.active) {
            console.log('Opening WebSocket...');
            this.stompClient.activate();
        }
    }

    disconnect(): void {
        if (this.stompClient.active) {
            this.stompClient.deactivate();
        }
    }

    sendMessage(destination: string, messageContent: string, senderId: string, receiverId: number): void {
        if (this.stompClient.active) {
            const message = {
                senderId: senderId,
                receiverId: receiverId,
                content: messageContent,
                timestamp: new Date().toISOString(),
            };
            this.stompClient.publish({ destination, body: JSON.stringify(message) });
        } else {
            console.error('WebSocket connection is not active. Message not sent.');
        }
    }

    subscribe(destination: string, callback: (message: IMessage) => void): void {
        if (this.stompClient.active) {
            this.stompClient.subscribe(destination, (message) => {
                const parsedMessage = JSON.parse(message.body);
                callback(parsedMessage); // Pass parsed message to callback
            });
        } else {
            console.error('No STOMP connection found. Cannot subscribe.');
        }
    }

    getMessages(): Subject<any> {
        return this.messageSubject;
    }
}
