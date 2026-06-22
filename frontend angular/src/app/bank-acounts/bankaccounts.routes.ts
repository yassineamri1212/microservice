import { Routes } from '@angular/router';
import {BankAcountsComponent} from "./bank-acounts.component";

export default [

    {
        path     : '',
        component: BankAcountsComponent,
    },
    {
        path     : 'bankacounts',
        component: BankAcountsComponent,
    }
] as Routes;
