import { Routes } from '@angular/router';
import {CheckreservationComponent} from "./checkreservation.component";

export default [

    {
        path     : '',
        component: CheckreservationComponent,
    },
    {
        path     : 'checkreservation',
        component: CheckreservationComponent,
    }
] as Routes;

