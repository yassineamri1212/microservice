import { Routes } from '@angular/router';
import {FileManagerListComponent} from "../../modules/admin/apps/file-manager/list/list.component";
import {MatiereListComponent} from "./list.component";

export default [

    {
        path     : '',
        component: MatiereListComponent,
    },

] as Routes;
