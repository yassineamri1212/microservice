import { Routes } from '@angular/router';
import {ShowreservationComponent} from "./showreservation.component";

export default [

    {
        path     : '',
        component: ShowreservationComponent,
    },
    {
        path     : 'reservations/:reservationId',
        component: ShowreservationComponent,
    }
] as Routes;

