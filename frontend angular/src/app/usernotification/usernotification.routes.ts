import { Routes } from '@angular/router';
import {UsernotificationComponent} from "./usernotification.component";

export default [

    {
        path     : '',
        component: UsernotificationComponent,
    },
    {
        path     : 'usernotification',
        component: UsernotificationComponent,
    }

] as Routes;
