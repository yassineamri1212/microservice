import { Routes } from '@angular/router';
import {AddmatiereComponent} from "./addmatiere.component";

export default [

    {
        path     : '',
        component: AddmatiereComponent,
    },
    {
        path     : 'addmatiere',
        component: AddmatiereComponent,
    }
] as Routes;
