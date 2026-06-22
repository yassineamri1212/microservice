import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { forkJoin } from 'rxjs';

import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';
import { ScrumboardBoardAddCardComponent } from './add-card/add-card.component';
import { ScrumboardBoardAddListComponent } from './add-list/add-list.component';
import {Board, Card, List} from "../scrumboard.models";
import {ScrumboardService} from "../scrumboard.service";
import {Boardss} from "../../../../Model/boardss";
import {BoardssService} from "../../../../boardss.service";
import {CardssService} from "../../../../cardss.service";
import {Cardss} from "../../../../Model/cardss";
import {IBoard, ILabel, IList, IMember} from "../scrumboard.types";

@Component({
    selector       : 'scrumboard-board',
    templateUrl    : './board.component.html',
    styleUrls      : ['./board.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatButtonModule, RouterLink, MatIconModule, CdkScrollable, CdkDropList, CdkDropListGroup, NgFor, CdkDrag, CdkDragHandle, MatMenuModule, NgIf, NgClass, ScrumboardBoardAddCardComponent, ScrumboardBoardAddListComponent, RouterOutlet, DatePipe],
})
export class ScrumboardBoardComponent implements OnInit, OnDestroy
{
    board1: IBoard = new class implements IBoard {
        description: string | null;
        icon: string | null;
        id: string | null;
        labels: ILabel[];
        lastActivity: string | null;
        lists: IList[];
        members: IMember[];
        title: string;
    };

    board: Boardss = new Boardss(this.board1);

    listTitleForm: UntypedFormGroup;
    idcard:string;
    title:string;
    listeid:string;
    boardid:string;
    description:string;
    cardsss1!:Cardss[];
    cardsss2!:Cardss[];
    cardsss3!:Cardss[];
    cardsss4!:Cardss[];


    // Private
    private readonly _positionStep: number = 65536;
    private readonly _maxListCount: number = 200;
    private readonly _maxPosition: number = this._positionStep * 500;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    id!: bigint;
    currentcardss:Cardss=new Cardss();
    addcard:Cardss=new Cardss();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _scrumboardService: BoardssService,
        private   route: ActivatedRoute,
        private cardservice: CardssService,
        private router: Router
    )
    {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

ngOnInit(): void {
    this.id = this.route.snapshot.params['boardId'];

    // Fetch all cards in parallel
    forkJoin({
                 cards1: this.cardservice.getcardBytitleId(BigInt("1")),
    cards2: this.cardservice.getcardBytitleId(BigInt("2")),
    cards3: this.cardservice.getcardBytitleId(BigInt("3")),
    cards4: this.cardservice.getcardBytitleId(BigInt("4")),
    board: this._scrumboardService.getboardssById(this.id),
}).subscribe(({ cards1, cards2, cards3, cards4, board }) => {
    this.cardsss1 = cards1;
    this.cardsss2 = cards2;
    this.cardsss3 = cards3;
    this.cardsss4 = cards4;

    this.board = board;
    this.board.lists = [
        {
            id: '1',
            boardId: this.board.id,
            position: 65536,
            title: 'To do',
            cards: this.cardsss1,
        },
        {
            id: '2',
            boardId: this.board.id,
            position: 131072,
            title: 'In progress',
            cards: this.cardsss2,
        },
        {
            id: '3',
            boardId: this.board.id,
            position: 196608,
            title: 'In review',
            cards: this.cardsss3,
        },
        {
            id: '4',
            boardId: this.board.id,
            position: 262144,
            title: 'Completed',
            cards: this.cardsss4,
        },
    ];

    // Trigger change detection
    this._changeDetectorRef.markForCheck();
});
}


/**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Focus on the given element to start editing the list title
     *
     * @param listTitleInput
     */
    renameList(listTitleInput: HTMLElement): void
    {
        // Use timeout so it can wait for menu to close
        setTimeout(() =>
        {
            listTitleInput.focus();
        });
    }

    /**
     * Add new list
     *
     * @param title
     */
    addList(title: string): void
    {
        // Limit the max list count
        if ( this.board.lists.length >= this._maxListCount )
        {
            return;
        }

        // Create a new list model
        const list = new List({
            boardId : this.board.id,
            position: this.board.lists.length ? this.board.lists[this.board.lists.length - 1].position + this._positionStep : this._positionStep,
            title   : title,
        });

        // Save the list
        this._scrumboardService.createList(list).subscribe();
    }

    /**
     * Update the list title
     *
     * @param event
     * @param list
     */
    updateListTitle(event: any, list: List): void
    {
        // Get the target element
        const element: HTMLInputElement = event.target;

        // Get the new title
        const newTitle = element.value;

        // If the title is empty...
        if ( !newTitle || newTitle.trim() === '' )
        {
            // Reset to original title and return
            element.value = list.title;
            return;
        }

        // Update the list title and element value
        list.title = element.value = newTitle.trim();

        // Update the list
        this._scrumboardService.updateList(list).subscribe();
    }

    /**
     * Delete the list
     *
     * @param id
     */
    deleteList(id): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete list',
            message: 'Are you sure you want to delete this list and its cards? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) =>
        {
            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Delete the list
                this._scrumboardService.deleteList(id).subscribe();
            }
        });
    }

    /**
     * Add new card
     */
    addCard(list: List, title: string): void
    {
        console.log(this.board);
        console.log(list);
        this.addcard.board=this.board.id;
        this.addcard.liste=list.id;
        this.addcard.title=title;
        this.cardservice.createcards(this.addcard).subscribe();

        this.board.lists[String( Number(list.id)-1)].cards.push(this.addcard);


               // Save the card
    }

    goTosuivieList(){
    }

    /**
     * List dropped
     *
     * @param event
     */
    listDropped(event: CdkDragDrop<List[]>): void
    {
        // Move the item
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        // Calculate the positions
        // Update the lists
    }

    /**
     * Card dropped
     *
     * @param event
     */
    cardDropped(event: CdkDragDrop<Cardss[]>): void
    {
        // Move or transfer the item
        if ( event.previousContainer === event.container )
        {
            console.log("here");
            // Move the item
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        else
        {
            console.log("we");

            // Transfer the item
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

            // Update the card's list it
            event.container.data[event.currentIndex].liste = event.container.id;
        }

        // Calculate the positions
        console.log("curent index"+event.container.data[event.currentIndex].liste);


        this.currentcardss.id=event.container.data[event.currentIndex].id;
        this.currentcardss.title=event.container.data[event.currentIndex].title;
        this.currentcardss.board=event.container.data[event.currentIndex].board;
        this.currentcardss.liste=event.container.data[event.currentIndex].liste;
        this.currentcardss.description=event.container.data[event.currentIndex].description;



        console.log( this.currentcardss);
        this.cardservice.updatecard(this.currentcardss).subscribe( data =>{
            }
            , error => console.log(error));
    }

        // Update the cards
    }


