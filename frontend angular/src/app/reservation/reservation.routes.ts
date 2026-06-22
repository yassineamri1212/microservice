import { Routes } from '@angular/router';
import {ReservationComponent} from "./reservation.component";

export default [

    {
        path     : '',
        component: ReservationComponent,
    },
    {
        path     : 'reservations',
        component: ReservationComponent,
    }
] as Routes;

