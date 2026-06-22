import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {Chapitres} from "../file-manager.types";
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from "@angular/router";
import {FileManagerService} from "../file-manager.service";
import {MatDrawer, MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {Subject, takeUntil} from "rxjs";
import {FuseMediaWatcherService} from "../../../@fuse/services/media-watcher";

@Component({
  selector: 'app-chapitres',
  standalone: true,
    imports: [MatSidenavModule, RouterOutlet, NgIf, RouterLink, NgFor, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './chapitres.component.html',
  styleUrl: './chapitres.component.scss'
})

export class ChapitresComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    matiereId: string;
    chapitres: Chapitres[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _fileManagerService: FileManagerService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {}

    ngOnInit(): void {
        this.matiereId = this._activatedRoute.snapshot.paramMap.get('matiereId')!;

        // Fetch chapitres by matiereId
        this._fileManagerService.getChapitreByMatiereId(this.matiereId).subscribe((chapitres) => {
            this.chapitres = chapitres;
        });
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
    addchapitres()
    {
        this._router.navigate(['addchapitre', this.matiereId]);
    }




}
