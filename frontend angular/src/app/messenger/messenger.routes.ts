import { Routes } from '@angular/router';
import {MessengerComponent} from "./messenger.component";

export default [
    {
        path     : '',
        component: MessengerComponent,
    },
    {
        path     : 'messenger',
        component: MessengerComponent,
    },
] as Routes;
