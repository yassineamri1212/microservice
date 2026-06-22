import { Routes } from '@angular/router';
import {MeetComponent} from "./meet.component";

export default [
    {
        path     : '',
        component: MeetComponent,
    },
    {
        path     : 'meetings/:roomName',
        component: MeetComponent,
    },
] as Routes;
