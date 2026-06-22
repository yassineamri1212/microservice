import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

// Polyfill for global (required by SockJS and STOMP)
(window as any).global = window;

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
