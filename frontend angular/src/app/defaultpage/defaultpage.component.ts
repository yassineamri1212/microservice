import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-defaultpage',
  standalone: true,
    imports: [CommonModule, RouterLink],
  templateUrl: './defaultpage.component.html',
  styleUrl: './defaultpage.component.scss'
})
export class DefaultpageComponent {

}
