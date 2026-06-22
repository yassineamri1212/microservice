import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { assign } from 'lodash-es';
import { DateTime } from 'luxon';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import {Board, Card, Label} from "../../scrumboard.models";
import {ScrumboardService} from "../../scrumboard.service";
import {Boardss} from "../../../../../Model/boardss";
import {Cardss} from "../../../../../Model/cardss";
import {CardssService} from "../../../../../cardss.service";
import {BoardssService} from "../../../../../boardss.service";
import {ActivatedRoute} from "@angular/router";
import {data} from "autoprefixer";
import {IBoard, ILabel, IList, IMember} from "../../scrumboard.types";

@Component({
    selector       : 'scrumboard-card-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatButtonModule, MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, TextFieldModule, NgClass, NgIf, MatDatepickerModule, NgFor, MatCheckboxModule, DatePipe],
})
export class ScrumboardCardDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;

    board1 :IBoard = new class implements IBoard {
        description: string | null;
        icon: string | null;
        id: string | null;
        labels: ILabel[];
        lastActivity: string | null;
        lists: IList[];
        members: IMember[];
        title: string;
    };
    board: Boardss ;
    card: Cardss;

    id: bigint ;
    cardForm: UntypedFormGroup;
    labels: Label[];
    filteredLabels: Label[];

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<ScrumboardCardDetailsComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _scrumboardService: ScrumboardService,
        private  cardservice:CardssService,
        private  boardservice:BoardssService,
        private route: ActivatedRoute,
        @Inject(MAT_DIALOG_DATA) public data: any


    )
    {
        this.board= new Boardss(this.board1);
        this.card = new Cardss();
        console.log('Received ID:', this.data);
        this.id= this.data.id;
        console.log(this.id);
        this.cardservice.getcardById( this.data.id).subscribe(data=>{
            this.card=data;
            console.log(this.card);
            this.boardservice.getboardssById(BigInt(data.board)).subscribe(BOARD => {
                this.board=BOARD;

                this.cardForm = this._formBuilder.group({
                    id         : [''],
                    title      : ['', Validators.required],
                    description: [''],

                });

                // Fill the form
                this.cardForm.setValue({
                    id         : this.data.id,
                    title      : this.data.title,
                    description: this.data.description,

                });

                // Update card when there is a value change on the card form
                this.cardForm.valueChanges
                    .pipe(
                        tap((value) =>
                        {
                            // Update the card object
                            this.card = assign(this.data, value);
                        }),
                        debounceTime(300),
                        takeUntil(this._unsubscribeAll),
                    )
                    .subscribe((value) =>
                    {
                        // Update the card on the server
                        this._scrumboardService.updateCard(value.id, value).subscribe();

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

            });
        } );




        // Get the card details


        // Prepare the card form

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the board

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
     * Return whether the card has the given label
     *
     * @param label
     */
    hasLabel(label: Label): boolean
    {
        return false;
    }

    /**
     * Filter labels
     *
     * @param event
     */
    filterLabels(event): void
    {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the labels
        this.filteredLabels = this.labels.filter(label => label.title.toLowerCase().includes(value));
    }

    /**
     * Filter labels input key down event
     *
     * @param event
     */
    filterLabelsInputKeyDown(event): void
    {
        // Return if the pressed key is not 'Enter'
        if ( event.key !== 'Enter' )
        {
            return;
        }

        // If there is no label available...
        if ( this.filteredLabels.length === 0 )
        {
            // Return
            return;
        }

        // If there is a label...
        const label = this.filteredLabels[0];

        // If the found label is already applied to the card...

    }

    /**
     * Toggle card label
     *
     * @param label
     * @param change
     */
    toggleProductTag(label: Label, change: MatCheckboxChange): void
    {
        if ( change.checked )
        {
            this.addLabelToCard(label);
        }
        else
        {
            this.removeLabelFromCard(label);
        }
    }

    /**
     * Add label to the card
     *
     * @param label
     */
    addLabelToCard(label: Label): void
    {
        // Add the label

        // Update the card form data

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove label from the card
     *
     * @param label
     */
    removeLabelFromCard(label: Label): void
    {
        // Remove the label

        // Update the card form data

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if the given date is overdue
     */
    isOverdue(date: string): boolean
    {
        return DateTime.fromISO(date).startOf('day') < DateTime.now().startOf('day');
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Read the given file for demonstration purposes
     *
     * @param file
     */
    private _readAsDataURL(file: File): Promise<any>
    {
        // Return a new promise
        return new Promise((resolve, reject) =>
        {
            // Create a new reader
            const reader = new FileReader();

            // Resolve the promise on success
            reader.onload = (): void =>
            {
                resolve(reader.result);
            };

            // Reject the promise on error
            reader.onerror = (e): void =>
            {
                reject(e);
            };

            // Read the file as the
            reader.readAsDataURL(file);
        });
    }
}
