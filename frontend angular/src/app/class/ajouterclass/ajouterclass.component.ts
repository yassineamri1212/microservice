import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ClasseService } from '../../classe.service';
import {Router} from "@angular/router";
import {MatInputModule} from "@angular/material/input";
interface Classe {
    id: number;
    name: string;
    eleves: any[];
    professors: any[];
}
@Component({
    selector: 'app-ajouter-classe',
    standalone: true,
    templateUrl: './ajouterclass.component.html',
    styleUrls: ['./ajouterclass.component.scss'],
    imports: [
        MatInputModule,
        ReactiveFormsModule,
        FormsModule
    ]
})
export class AjouterClasseComponent {
    ClasseForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private classeService: ClasseService,
        private router: Router
    ) {
        this.ClasseForm = this.fb.group({
            nom: ['', Validators.required] // Form field with validation
        });
    }

    onSubmit() {
        if (this.ClasseForm.valid) {
            const classeData: Classe = {
                id:null,
                name: this.ClasseForm.value.nom,
                eleves: [], // Default empty array
                professors: [] // Default empty array
            };

            // Call the service to add the class
            this.classeService.createClasse(classeData).subscribe(
                (response) => {
                    console.log('Classe added successfully:', response);
                    alert('Classe ajoutée avec succès!');
                    this.ClasseForm.reset(); // Reset form after submission
                    this.router.navigate(['/classdashboard']); // Redirect to the dashboard
                },
                (error) => {
                    console.error('Error while adding classe:', error);
                    alert('Erreur lors de l\'ajout de la classe. Veuillez réessayer.');
                }
            );
        }
    }
}

