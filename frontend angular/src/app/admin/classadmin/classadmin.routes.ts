import { Routes } from '@angular/router';
import {ClassadminComponent} from "./classadmin.component";

export default [

    {
        path     : '',
        component: ClassadminComponent,
    },
    {
        path     : 'classdashboard',
        component: ClassadminComponent,
    }
] as Routes;
