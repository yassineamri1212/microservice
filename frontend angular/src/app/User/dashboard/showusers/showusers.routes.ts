import { Routes } from '@angular/router';
import {ShowusersComponent} from "./showusers.component";

export default [

    {
        path     : '',
        component: ShowusersComponent,
    },
    {
        path     : 'show-users',
        component: ShowusersComponent,
    }
] as Routes;
