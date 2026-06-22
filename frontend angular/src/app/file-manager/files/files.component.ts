import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDrawer, MatSidenavModule} from "@angular/material/sidenav";
import {Chapitres, Cours, Item, Items, Matiere} from "../file-manager.types";
import {Subject, takeUntil} from "rxjs";
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from "@angular/router";
import {FileManagerService} from "../file-manager.service";
import {FuseMediaWatcherService} from "../../../@fuse/services/media-watcher";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-files',
  standalone: true,
    imports: [CommonModule, MatSidenavModule, RouterOutlet, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: Item;
    items: Items;
    matieres: Matiere[] = [];
    chapitres: Chapitres= new class implements Chapitres {
        cours: Cours[];
        id: string;
        id_matiere: string;
        nom: string;
    } ;
    cours: Cours[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
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
        // Fetch matieres, chapitres, and cours data
        this._fileManagerService.getAllMatieres()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((matieres: Matiere[]) => {
                this.matieres = matieres;
                this._changeDetectorRef.markForCheck();
            });

        this._fileManagerService.getAllChapitres()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chapitres: Chapitres[]) => {
               // this.chapitres = chapitres;
                this._changeDetectorRef.markForCheck();
            });

        this._fileManagerService.getChapitreById(this._activatedRoute.snapshot.params['chapitreId'])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chapitres: Chapitres) => {
                console.log("test1"+chapitres.cours);
                this.cours = chapitres.cours;
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

    uploadfile()
    {
        this._router.navigate(['addfile', this._activatedRoute.snapshot.params['chapitreId']]);

    }
}
