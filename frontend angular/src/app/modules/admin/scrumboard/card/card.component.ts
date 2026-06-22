import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {ScrumboardCardDetailsComponent} from "./details/details.component";

@Component({
    selector       : 'scrumboard-card',
    templateUrl    : './card.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class ScrumboardCardComponent implements OnInit
{

    id: bigint ;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _matDialog: MatDialog,
        private _router: Router,
        private route: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.id = this.route.snapshot.params['cardId'];
        console.log(this.route.snapshot.params['cardId']);
        // Launch the modal
        this._matDialog.open(ScrumboardCardDetailsComponent, {autoFocus: false,
            data: { id: this.route.snapshot.params['cardId']}
        })
            .afterClosed()
            .subscribe(() =>
            {
                // Go up twice because card routes are set up like this; "card/CARD_ID"
                this._router.navigate(['./../..'], {relativeTo: this._activatedRoute});
            });
    }
}
