import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Usertype} from "../../Model/usertype";
import {UserService} from "../../user.service";
import {Router} from "@angular/router";
import {ServiceStageService} from "../../service-stage.service";
import {ClasseService} from "../../classe.service";
import {CdkScrollable} from "@angular/cdk/overlay";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
interface Classe {
    id: number;
    name: string;
    eleves: any[];
    professors: any[];

}
@Component({
  selector: 'app-classadmin',
  standalone: true,
    imports: [CommonModule, CdkScrollable, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './classadmin.component.html',
  styleUrl: './classadmin.component.scss'
})

export class ClassadminComponent {


    displayedColumns: string[] = [ 'id', 'name',  'action'];
    ELEMENT_DATA!: Classe[];
    classes!: Classe[];
    dataSource:Classe[]= this.ELEMENT_DATA;
    constructor(private classservice: ClasseService,
                private router: Router) { }


    gotoadduser(){
        this.router.navigate(['ajouterclasse']);
    }
    ngOnInit(): void {
        this.getclasses();

    }
    ngAfterViewInit(): void {

        this.dataSource=this.classes;

    }

    private getclasses(){
        this.classservice.getAllClasses().subscribe(data => {

            this.classes = data;
            this.dataSource=data;
            console.log(data);

        });

    }



    updateclasse(id: bigint){
        this.router.navigate(['classdashboard/editclass', id]);
    }


    deleteclasse(classeId: bigint): void {
        this.classservice.deleteClasse(Number(classeId)).subscribe(() => {
            console.log('Classe deleted');
            this.router.navigate(['classdashboard']).then(() => {
                window.location.reload();
            });        });
    }

    assignprofessor(id) {
        this.router.navigate(['assigntoclass', id]);

    }

    assignstudent(id) {
        this.router.navigate(['assignstudent', id]);

    }
}
