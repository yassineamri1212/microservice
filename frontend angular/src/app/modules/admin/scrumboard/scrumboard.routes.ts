import { inject } from '@angular/core';

import { catchError, Observable, throwError } from 'rxjs';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes} from "@angular/router";
import {Board} from "./scrumboard.models";
import {ScrumboardService} from "./scrumboard.service";
import {ScrumboardBoardsComponent} from "./boards/boards.component";
import {ScrumboardBoardComponent} from "./board/board.component";
import {ScrumboardCardComponent} from "./card/card.component";
import {BoardssService} from "../../../boardss.service";
import {Boardss} from "../../../Model/boardss";
import {CardssService} from "../../../cardss.service";

/**
 * Board resolver
 *
 * @param route
 * @param state
 */
const boardResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Boardss> =>
{
    const scrumboardService = inject(BoardssService);
    const router = inject(Router);

    return scrumboardService.getboardssById( BigInt(route.paramMap.get('boardId') ))
        .pipe(
            // Error here means the requested board is not available
            catchError((error) =>
            {
                // Log the error
                console.error(error);

                // Get the parent url
                const parentUrl = state.url.split('/').slice(0, -1).join('/');

                // Navigate to there
                router.navigateByUrl(parentUrl);

                // Throw an error
                return throwError(error);
            }),
        );
};

/**
 * Card resolver
 *
 * @param route
 * @param state
 */
const cardResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const scrumboardService = inject(CardssService);
    const router = inject(Router);


};

export default [
    {
        path     : '',
        component: ScrumboardBoardsComponent,
        resolve  : {
            boards: () => inject(BoardssService).getboardList(),
        },
    },
    {
        path     : ':boardId',
        component: ScrumboardBoardComponent,
        resolve  : {
            board: boardResolver,
        },
        children : [
            {
                path     : 'card/:cardId',
                component: ScrumboardCardComponent,
                resolve  : {
                    card: cardResolver,
                },
            },
        ],
    },
] as Routes;
