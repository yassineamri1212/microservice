import { Routes } from '@angular/router';
import {AddfileComponent} from "./addfile.component";

export default [

    {
        path     : '',
        component: AddfileComponent,
    },
    {
        path     : 'addfile/:chapitreId',
        component: AddfileComponent,
    }
] as Routes;
