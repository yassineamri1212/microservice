import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthService} from "./core/auth/auth.service";

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss'],
    standalone : true,
    imports    : [RouterOutlet],
})
export class AppComponent
{
    /**
     * Constructor
     */
    constructor(private authService: AuthService) {
        // this.authService.check().subscribe((authenticated) => {
        //     if (!authenticated) {
        //         this.authService.keycloakAuth.login();
        //     }
        // });
    }
}
