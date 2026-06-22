import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { FileManagerService } from 'app/file-manager/file-manager.service';
import { Item } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { FileManagerListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { Subject, takeUntil } from 'rxjs';
import {Chapitres, Cours, Matiere} from "../file-manager.types";
import {ChapitresComponent} from "../chapitres/chapitres.component";
import {FilesComponent} from "../files/files.component";
import {HttpClient} from "@angular/common/http";

@Component({
    selector       : 'file-manager-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatButtonModule, RouterLink, MatIconModule, NgIf],
})
export class FileManagerDetailsComponent implements OnInit, OnDestroy
{
    item: Cours;
    id!: bigint;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FilesComponent,
        private _fileManagerService: FileManagerService,
        private route: ActivatedRoute,
        private http: HttpClient
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
        // Open the drawer
        this._fileManagerListComponent.matDrawer.open();
        this.id = this.route.snapshot.params['idDetails'];
            console.log("3aaasbaa", this.route.snapshot.params['idDetails']);
        // Get the item
        this._fileManagerService.getCoursById(String(this.id))
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cours: Cours) =>
            {
                // Open the drawer in case it is closed
                this._fileManagerListComponent.matDrawer.open();

                // Get the item
                this.item = cours;

                // Mark for check
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
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._fileManagerListComponent.matDrawer.close();
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
    downloadCours() {
        const coursId = this.item.id;  // Use the course ID from the item
        const fileName = this.item.name;  // File name from the item (e.g., "course-material.pdf")
        const fileType = this.item.type;  // File type from the item (e.g., "application/pdf")

        // Backend URL to fetch the file using the course ID
        const url = `http://localhost:8082/api/cours/download/${coursId}`;

        // Request the file from the backend as a Blob
        this.http.get(url, { responseType: 'blob' }).subscribe((blob: Blob) => {
            // Create a Blob object using the fetched file
            const fileBlob = new Blob([blob], { type: fileType });

            // Create a download link for the Blob object
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(fileBlob);
            a.href = objectUrl;
            a.download = fileName; // Use the file name from the item
            a.click(); // Trigger the download
            URL.revokeObjectURL(objectUrl); // Clean up the object URL
        }, error => {
            console.error('Error downloading the file:', error);
        });
    }



}
