import { Routes } from '@angular/router';
import {FileManagerListComponent} from "../../modules/admin/apps/file-manager/list/list.component";
import {ChapitresComponent} from "./chapitres.component";
import {EdituserComponent} from "../../User/edituser/edituser.component";

export default [

    {
        path     : '',
        component: ChapitresComponent,
    },
    {
        path     : 'matieres/:id',
        component: ChapitresComponent,
    }
] as Routes;
