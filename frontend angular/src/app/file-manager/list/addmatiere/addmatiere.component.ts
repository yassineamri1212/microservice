import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Matiere } from '../../file-manager.types';
import { FileManagerService } from '../../file-manager.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ServiceStageService } from '../../../service-stage.service';
import {ClasseService} from "../../../classe.service";
import {MatSelectModule} from "@angular/material/select";

@Component({
    selector: 'app-addmatiere',
    standalone: true,
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatSelectModule],
    templateUrl: './addmatiere.component.html',
    styleUrls: ['./addmatiere.component.scss']
})
export class AddmatiereComponent implements OnInit {
    matiere: Matiere = {
        chapitres: [],
        id: '',
        nom: '',
    };

    MatiereForm = new FormGroup({
        nom: new FormControl('', Validators.required),
        classId: new FormControl('', Validators.required), // Added classId
    });

    selectedFile: File | null = null;
    classes: any[] = []; // Array to hold classes from the API

    constructor(
        private matiereservice: FileManagerService,
        private classService: ClasseService, // Inject ClassService
        private router: Router,
        private authservice: AuthService,
        private stageservice: ServiceStageService
    ) {}

    ngOnInit(): void {
        console.log(this.authservice.accessToken);
        this.fetchClasses(); // Fetch classes on initialization
    }

    fetchClasses(): void {
        this.classService.getAllClasses().subscribe(
            (data) => {
                this.classes = data;
            },
            (error) => {
                console.error('Error fetching classes:', error);
            }
        );
    }

    onFileSelected(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        if (fileInput.files && fileInput.files.length > 0) {
            this.selectedFile = fileInput.files[0];
        }
    }

    savedemande(): void {
        if (!this.selectedFile) {
            console.error('No file selected!');
            return;
        }

        const formData = new FormData();
        formData.append('nom', this.MatiereForm.get('nom')?.value || '');
        formData.append('classId', this.MatiereForm.get('classId')?.value || '');
        formData.append('image', this.selectedFile);

        this.matiereservice.createMatieree(formData).subscribe(
            (data) => {
                console.log(data);
                this.router.navigate(['listematieres']);
            },
            (error) => console.error(error)
        );
    }

    onSubmit(): void {
        this.savedemande();
    }
}
