import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../user.service";
import {ClasseService} from "../../classe.service";

@Component({
  selector: 'app-assignstudent',
  standalone: true,
    imports: [CommonModule, FormsModule, MatInputModule, MatSelectModule],
  templateUrl: './assignstudent.component.html',
  styleUrl: './assignstudent.component.scss'
})
export class AssignstudentComponent implements OnInit {
    classId!: number;
    students: any[] = [];
    selectedStudentId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private classeService: ClasseService
    ) {}

    ngOnInit(): void {
        // Get the class ID from the route
        this.classId = +this.route.snapshot.paramMap.get('classId')!;

        // Fetch the list of users with the role "eleve"
        this.userService.getUsersByRole('etudiant').subscribe((data) => {
            this.students = data;
        });
    }

    assignStudent(): void {
        if (this.selectedStudentId) {
            this.classeService
                .addEleveToClasse(this.classId, this.selectedStudentId)
                .subscribe(
                    () => {
                        alert('L\'élève a été assigné avec succès !');
                        this.router.navigate(['classdashboard']);
                    },
                    (error) => {
                        console.error('Erreur lors de l\'assignation de l\'élève', error);
                    }
                );
        }
    }
}
