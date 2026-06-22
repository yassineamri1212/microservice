import { Routes } from '@angular/router';
import {CnssrequestComponent} from "./cnssrequest.component";

export default [

    {
        path     : '',
        component: CnssrequestComponent,
    },
    {
        path     : 'paymentrequest',
        component: CnssrequestComponent,
    }
] as Routes;

