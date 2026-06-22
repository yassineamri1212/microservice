import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { ClasseService } from '../../classe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from "../../user.service";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";

interface Classe {
    id: number;
    name: string;
    eleves: any[];
    professors: any[];
}

@Component({
    selector: 'app-assign-users-to-class',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, MatInputModule, MatSelectModule],
    templateUrl: './assigntoclass.component.html',
    styleUrls: ['./assigntoclass.component.scss']
})
export class AssignUsersToClassComponent implements OnInit {
    classId!: number;
    professors: any[] = [];
    selectedProfessorId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private classeService: ClasseService
    ) {}

    ngOnInit(): void {
        // Récupérer l'ID de la classe depuis la route
        this.classId = +this.route.snapshot.paramMap.get('classId')!;

        // Obtenir la liste des utilisateurs avec le rôle "professeur"
        this.userService.getUsersByRole('professeur').subscribe((data) => {
            this.professors = data;
        });
    }

    assignProfessor(): void {
        if (this.selectedProfessorId) {
            this.classeService
                .assignProfessorToClass(this.classId, this.selectedProfessorId)
                .subscribe(
                    () => {
                        alert('Le professeur a été assigné avec succès !');
                        this.router.navigate(['classdashboard']);
                    },
                    (error) => {

                    }
                );
        }
    }
}
