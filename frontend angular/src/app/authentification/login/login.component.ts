import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {KeycloakAuthServiceService} from "../../keycloak-auth-service.service";
import {FuseAlertComponent} from "../../../@fuse/components/alert";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FuseAlertComponent, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  {
  DemandeForm = new FormGroup({

    username : new FormControl('', Validators.required),
    password : new FormControl('', Validators.required)});


  constructor(private authService: KeycloakAuthServiceService) {

  }


  onLogin(): void {

  }
  onSubmit(){
    this.onLogin();
  }
}
