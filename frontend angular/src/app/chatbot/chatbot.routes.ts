import { Routes } from '@angular/router';
import {ChatbotComponent} from "./chatbot.component";

export default [

    {
        path     : '',
        component: ChatbotComponent,
    },
    {
        path     : 'chatbot',
        component: ChatbotComponent,
    }
] as Routes;
