import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Cours, Matiere } from "../../file-manager.types";
import { FileManagerService } from "../../file-manager.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";
import { ServiceStageService } from "../../../service-stage.service";
import { MatButtonModule } from "@angular/material/button";

export interface Chapitres {
    id?: string;
    matiere: Matiere;  // Matiere remains an interface
    nom?: string;
    cours: Cours[];
}

@Component({
    selector: 'app-addchapitre',
    standalone: true,
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatButtonModule],
    templateUrl: './addchapitre.component.html',
    styleUrls: ['./addchapitre.component.scss']
})
export class AddchapitreComponent {

    // Initialize 'chapitre' with 'matiere' as an object (not a class)
    chapitre: Chapitres = {
        matiere: { chapitres: [] }, // Initializing as an object with the required structure
        cours: [] // Initializing cours as an empty array
    };

    ChapitresForm = new FormGroup({
        nom: new FormControl('', Validators.required)
    });

    constructor(
        private chapiteresservice: FileManagerService,
        private router: Router,
        private route: ActivatedRoute,
        private authservice: AuthService,
        private stageservice: ServiceStageService
    ) { }

    ngOnInit(): void {
        console.log(this.authservice.accessToken);
    }

    savedemande() {
        // Ensure 'matiere' is correctly initialized as an object if undefined
        if (!this.chapitre.matiere) {
            this.chapitre.matiere = { chapitres: [] }; // Initialize as an object with 'chapitres' array
        }

        // Set 'nom' from form control value
        this.chapitre.nom = this.ChapitresForm.get('nom')?.getRawValue();

        // Set 'matiere.id' from URL parameter
        const matiereId = this.route.snapshot.params['id'];
        if (matiereId) {
            this.chapitre.matiere.id = String(matiereId);  // Ensure 'matiere.id' is set from URL
        }

        // Send the 'chapitre' object to the service to save it
        this.chapiteresservice.createChapitre(this.chapitre).subscribe(data => {
            console.log('Chapitre created:', data);
            this.router.navigate(['listematieres']);  // Navigate after saving
        }, error => {
            console.log('Error creating Chapitre:', error);
        });
    }

    goToUserList() {
        this.router.navigate(['listematieres']);
    }

    onSubmit() {
        console.log('Chapitre form data:', this.chapitre);
        this.savedemande();
    }
}
