import { Routes } from '@angular/router';
import {LoginComponent} from "./login.component";


export default [

    {
        path     : '',
        component: LoginComponent,
    },
    {
        path     : 'logintest',
        component: LoginComponent,
    },

] as Routes;
