import { Routes } from '@angular/router';
import {SignaturePadComponent} from "./signature-pad.component";

export default [

    {
        path     : '',
        component: SignaturePadComponent,
    },
    {
        path     : 'signandgo',
        component: SignaturePadComponent,
    }
] as Routes;

