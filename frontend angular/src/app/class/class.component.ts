import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import {ClasseService} from "../classe.service";
import {AuthService} from "../core/auth/auth.service";
import {User} from "../core/user/user.types";
import {UserService} from "../user.service";
import {Usertype} from "../Model/usertype";

interface Classe {
    id: number;
    name: string;
    eleves: any[];
    professors: any[];
}
@Component({
    selector       : 'project',
    templateUrl    : './class.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [TranslocoModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, MatTableModule],
})
export class ClassComponent implements OnInit
{


    classes: Classe[] = [];
    errorMessage: string = '';
    imagePath: string = 'assets/images/avatars/avatar1.jpg';
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    professor :any;
    /**
     * Constructor
     */
    constructor(
        private  classeService: ClasseService,
        private _router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private authService:AuthService,
        private _userService: UserService,
    )
    {

    }

    ngOnInit(): void {
        this.loadClasses();
    }

    loadClasses(): void {
        this.authService.getCurrentUserProfile().subscribe((value) => {
            this.user = value;

            this._userService.getUserByEmail(sessionStorage.getItem('email')).subscribe({
                next: (data) => {
                    this.professor = data.id;

                    // Fetch classes
                    this.classeService.getClassesByProfessorId(this.professor).subscribe(
                        (data) => {
                            // Process each class and fetch professor details
                            const classProcessingPromises = data.map(async (classe: any) => {
                                const processedProfessors = await Promise.all(
                                    classe.professeurs.map(async (professeur: any) => {
                                        const professorId =
                                            typeof professeur === 'string'
                                                ? professeur // It's already an ID
                                                : professeur.keycloakUserId; // Extract ID from the object

                                        try {
                                            const professor = await this._userService
                                                .getuserById2(professorId)
                                                .toPromise(); // Convert observable to promise for async/await
                                            return {
                                                keycloakUserId: professorId,
                                                name: professor.firstName,
                                                email: professor.email,
                                            };
                                        } catch (error) {
                                            console.error('Error fetching professor details:', error);
                                            return {
                                                keycloakUserId: professorId,
                                                name: 'Unknown',
                                                email: 'Unknown',
                                            };
                                        }
                                    })
                                );

                                return {
                                    ...classe,
                                    professors: processedProfessors,
                                };
                            });

                            // Wait for all classes to be processed
                            Promise.all(classProcessingPromises).then((processedClasses) => {
                                this.classes = processedClasses;
                                this.changeDetectorRef.markForCheck();
                                console.log('Processed classes:', this.classes);
                            });
                        },
                        (error) => {
                            this.errorMessage = 'There was an error fetching the classes.';
                            console.error(error);
                            this.classes = [];
                        }
                    );
                },
                error: (err) => {
                    console.error('Error fetching user:', err);
                    this.professor = null;
                },
            });
        });
    }


    protected readonly sessionStorage = sessionStorage;
}
