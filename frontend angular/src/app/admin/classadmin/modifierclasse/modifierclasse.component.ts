import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Usertype} from "../../../Model/usertype";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../core/auth/auth.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {TextFieldModule} from "@angular/cdk/text-field";
import {ClasseService} from "../../../classe.service";
import {MatRadioModule} from "@angular/material/radio";
import {MatCheckboxModule} from "@angular/material/checkbox";
interface Classe {
    id: number;
    name: string;
    eleves: any[];
}
@Component({
  selector: 'app-modifierclasse',
  standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, TextFieldModule, FormsModule, MatRadioModule, MatCheckboxModule],
  templateUrl: './modifierclasse.component.html',
  styleUrl: './modifierclasse.component.scss'
})
export class ModifierclasseComponent {

    classe: Classe = new class implements Classe {
        eleves: any[];
        id: number;
        name: string;
    }();
    id!: number;
    allEleves: any[] = []; // All available students
    selectedEleves: any[] = []; // Selected students for the class
    ClassForm = new FormGroup({

        name : new FormControl('', Validators.required)});
    constructor(private classeservice: ClasseService,
                private router: Router,private  authservice: AuthService,private route: ActivatedRoute) { }


    ngOnInit(): void {
        this.id = this.route.snapshot.params['id'];

        this.loadClassDetails(this.route.snapshot.params['id']);


    }

    loadClassDetails(classeId: number): void {
        this.id = this.route.snapshot.params['id'];
        this.classe.id= this.id ;
        this.classeservice.getClasseById(this.id).subscribe(data => {
            this.classe = data;
            this.allEleves = data.eleves;

            this.selectedEleves = data.eleves.map((eleve: any) => eleve.id);
            this.selectedEleves = this.allEleves.map((eleve: any) => eleve.id);



            this.ClassForm.patchValue({
                name: this.classe.name


            });
        }, error => console.log(error));

    }
    onSubmit(){
        this.classe.name=this.ClassForm.get('name').getRawValue();

        this.classeservice.updateClasseName(this.id, this.classe.name).subscribe((updatedClasse) => {
            this.router.navigate(['classdashboard']);
        });
    }
    updateClassName(classeId: number, newName: string): void {

    }

    goToUserList(){
        this.router.navigate(['User/dashboard/show-users']);
    }


}
