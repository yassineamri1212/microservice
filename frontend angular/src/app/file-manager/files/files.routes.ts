import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes} from '@angular/router';
import {FileManagerListComponent} from "../../modules/admin/apps/file-manager/list/list.component";
import {FilesComponent} from "./files.component";
import {ChapitresComponent} from "../chapitres/chapitres.component";
import {FileManagerDetailsComponent} from "../details/details.component";
import {inject} from "@angular/core";
import {FileManagerService} from "../file-manager.service";
import {catchError, throwError} from "rxjs";

/**
 * Cours resolver
 *
 * @param route
 * @param state
 */
const coursResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);

    return fileManagerService.getAllCours().pipe(
        catchError((error) => {
            console.error(error);
            router.navigateByUrl('/');
            return throwError(error);
        })
    );
};

/**
 * Can deactivate file manager details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateFileManagerDetails = (
    component: FileManagerDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    if (!nextState.url.includes('/files')) {
        return true;
    }

    if (nextState.url.includes('/details')) {
        return true;
    }

    return component.closeDrawer().then(() => true);
};

export default [

    {
        path     : '',
        component: FilesComponent,

        children: [
            {
                path: 'details/:idDetails',
                component: FileManagerDetailsComponent,
                canDeactivate: [canDeactivateFileManagerDetails],
            },
        ],

    },
    {
        path     : 'matieres/:id/files/:chapitreId',
        component: FilesComponent,
    }
] as Routes;
