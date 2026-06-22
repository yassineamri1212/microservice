import { Routes } from '@angular/router';
import {EdituserroleComponent} from "./edituserrole.component";

export default [

    {
        path     : '',
        component: EdituserroleComponent,
    },
    {
        path     : 'editrole/:userId',
        component: EdituserroleComponent,
    }
] as Routes;

