import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

import { Subject, takeUntil } from 'rxjs';
import {Matiere, Items, Chapitres, Cours} from "../file-manager.types";
import { FileManagerService } from "../file-manager.service";

@Component({
    selector: 'matiere-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatSidenavModule, RouterOutlet, NgIf, RouterLink, NgFor, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class MatiereListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: Matiere;
    items: Items; // Items should hold matieres instead of files and folders
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    matieres: Matiere[] = [];
    chapitres: Chapitres[] = [];
    cours: Cours[] = [];
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {}

    ngOnInit(): void {
        // Fetch matieres, chapitres, and cours data
        this._fileManagerService.getAllMatieres()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((matieres: Matiere[]) => {
                this.matieres = matieres;
                console.log("hereeee"+this.matieres[0].image);
                this._changeDetectorRef.markForCheck();
            });

        this._fileManagerService.getAllChapitres()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chapitres: Chapitres[]) => {
                this.chapitres = chapitres;
                this._changeDetectorRef.markForCheck();
            });

        this._fileManagerService.getAllCours()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cours: Cours[]) => {
                this.cours = cours;
                this._changeDetectorRef.markForCheck();
            });

        // Handle media query changes
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                this.drawerMode = state.matches ? 'side' : 'over';
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    addmatiere()
    {
        this._router.navigate(['addmatiere']);

    }
}
