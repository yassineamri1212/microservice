import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManagerService } from '../../file-manager.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-addfile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './addfile.component.html',
    styleUrls: ['./addfile.component.scss']
})
export class AddfileComponent {

    coursForm = new FormGroup({
        contents: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required)
    });

    file: File | null = null;
    chapitreId: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fileService: FileManagerService
    ) {
        this.chapitreId = this.route.snapshot.params['chapitreId']; // Get chapitre ID from URL
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.file = input.files[0];
        }
    }

    onSubmit(): void {
        if (this.coursForm.valid && this.file) {
            const formData = new FormData();
            formData.append('contents', this.coursForm.get('contents')?.value);
            formData.append('description', this.coursForm.get('description')?.value);
            formData.append('file', this.file);
            formData.append('chapitreId', this.chapitreId);

            this.fileService.addCours(formData).subscribe(
                (response) => {
                    console.log('Cours added successfully:', response);
                    this.router.navigate(['/listematieres']); // Navigate to the desired route after success
                },
                (error) => {
                    console.error('Error adding cours:', error);
                }
            );
        }
    }
}
