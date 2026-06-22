import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes} from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { FileManagerService } from './file-manager.service';
import { FileManagerDetailsComponent } from './details/details.component';
import { FileManagerComponent } from './file-manager.component';
import {inject} from "@angular/core";
import {FileManagerListComponent} from "../modules/admin/apps/file-manager/list/list.component";

/**
 * Matiere resolver
 *
 * @param route
 * @param state
 */
const matiereResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);

    return fileManagerService.getAllMatieres().pipe(
        catchError((error) => {
            console.error(error);
            router.navigateByUrl('/');
            return throwError(error);
        })
    );
};

/**
 * Chapitre resolver
 *
 * @param route
 * @param state
 */
const chapitreResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);

    return fileManagerService.getAllChapitres().pipe(
        catchError((error) => {
            console.error(error);
            router.navigateByUrl('/');
            return throwError(error);
        })
    );
};

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

    if (!nextState.url.includes('/file-manager')) {
        return true;
    }

    if (nextState.url.includes('/details')) {
        return true;
    }

    return component.closeDrawer().then(() => true);
};

const fileManagerRoutes: Routes = [
    {
        path: '',
        component: FileManagerComponent,
        children: [
            {
                path: 'matieres',
                component: FileManagerListComponent,
                resolve: {
                    items: matiereResolver,
                },
                children: [
                    {
                        path: ':matiereId/chapitres',
                        component: FileManagerListComponent,
                        resolve: {
                            items: chapitreResolver,
                        },
                        children: [
                            {
                                path: ':chapitreId/cours',
                                component: FileManagerListComponent,
                                resolve: {
                                    items: coursResolver,
                                },
                                children: [
                                    {
                                        path: 'details/:id',
                                        component: FileManagerDetailsComponent,
                                        canDeactivate: [canDeactivateFileManagerDetails],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export default fileManagerRoutes;
