import { Routes } from '@angular/router';
import {AddchapitreComponent} from "./addchapitre.component";

export default [

    {
        path     : '',
        component: AddchapitreComponent,
    },
    {
        path     : 'addchapitre/:id',
        component: AddchapitreComponent,
    }
] as Routes;
