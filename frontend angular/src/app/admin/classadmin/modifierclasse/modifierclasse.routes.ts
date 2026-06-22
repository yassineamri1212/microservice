import { Routes } from '@angular/router';
import {ModifierclasseComponent} from "./modifierclasse.component";

export default [

    {
        path     : '',
        component: ModifierclasseComponent,
    },
    {
        path     : 'editclass/:id',
        component: ModifierclasseComponent,
    }
] as Routes;
