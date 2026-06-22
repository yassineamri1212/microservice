import { DOCUMENT, NgIf } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FusePlatformService } from '@fuse/services/platform';
import { FUSE_VERSION } from '@fuse/version';
import { combineLatest, filter, map, Subject, takeUntil } from 'rxjs';
import { SettingsComponent } from './common/settings/settings.component';
import { EmptyLayoutComponent } from './layouts/empty/empty.component';
import { CenteredLayoutComponent } from './layouts/horizontal/centered/centered.component';
import { EnterpriseLayoutComponent } from './layouts/horizontal/enterprise/enterprise.component';
import { MaterialLayoutComponent } from './layouts/horizontal/material/material.component';
import { ModernLayoutComponent } from './layouts/horizontal/modern/modern.component';
import { ClassicLayoutComponent } from './layouts/vertical/classic/classic.component';
import { ClassyLayoutComponent } from './layouts/vertical/classy/classy.component';
import { CompactLayoutComponent } from './layouts/vertical/compact/compact.component';
import { DenseLayoutComponent } from './layouts/vertical/dense/dense.component';
import { FuturisticLayoutComponent } from './layouts/vertical/futuristic/futuristic.component';
import { ThinLayoutComponent } from './layouts/vertical/thin/thin.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AuthService } from "../core/auth/auth.service";
import { UserService } from "../user.service";

@Component({
    selector     : 'layout',
    templateUrl  : './layout.component.html',
    styleUrls    : ['./layout.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [NgIf, EmptyLayoutComponent, CenteredLayoutComponent, EnterpriseLayoutComponent, MaterialLayoutComponent, ModernLayoutComponent, ClassicLayoutComponent, ClassyLayoutComponent, CompactLayoutComponent, DenseLayoutComponent, FuturisticLayoutComponent, ThinLayoutComponent, SettingsComponent, KeycloakAngularModule],
    providers    : [KeycloakService]
})
export class LayoutComponent implements OnInit, OnDestroy {
    config: FuseConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: any; // We'll use sessionStorage for the user details

    constructor(
        private _activatedRoute: ActivatedRoute,
        @Inject(DOCUMENT) private _document: any,
        private _renderer2: Renderer2,
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fusePlatformService: FusePlatformService,
        private authService: AuthService,
        private userservice: UserService,
    ) {}

    ngOnInit(): void {
        console.log("Initializing LayoutComponent");

        // Fetch user data from sessionStorage
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('username');
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const email = sessionStorage.getItem('email');

        // Handle roles with a safer fallback
        let roles: string[] = [];
        try {
            roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
            console.log(roles);
        } catch (e) {
            this.layout = "material";
            console.error('Error parsing roles from sessionStorage:', e);
            roles = [];
// Fallback to an empty array in case of parsing error
        }

        // Set user data if available
        if (userId && username && roles) {
            this.user = { id: userId, username, firstName, lastName, email, roles };
            console.log("User data from session storage:", this.user);
        }

        // Set theme and scheme based on configuration
        combineLatest([
            this._fuseConfigService.config$,
            this._fuseMediaWatcherService.onMediaQueryChange$(['(prefers-color-scheme: dark)', '(prefers-color-scheme: light)']),
        ])
            .pipe(
                takeUntil(this._unsubscribeAll),
                map(([config, mql]) => {
                    const options = {
                        scheme: config.scheme,
                        theme: config.theme,
                    };

                    if (config.scheme === 'auto') {
                        options.scheme = mql.breakpoints['(prefers-color-scheme: dark)'] ? 'dark' : 'light';
                    }

                    return options;
                })
            )
            .subscribe((options) => {
                this.scheme = options.scheme;
                this.theme = options.theme;
                this._updateScheme();
                this._updateTheme();
            });

        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                this.config = config;
                this._updateLayout();
            });

        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._updateLayout();
            });

        this._renderer2.setAttribute(this._document.querySelector('[ng-version]'), 'fuse-version', FUSE_VERSION);
        this._renderer2.addClass(this._document.body, this._fusePlatformService.osName);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private _updateLayout(): void {
        let route = this._activatedRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }

        // Fetch roles from sessionStorage safely
        try {
            const test = JSON.parse(sessionStorage.getItem('roles') || '[]').angular.roles;
            console.log(JSON.parse(sessionStorage.getItem('roles') || '[]').angular.roles);

        const roles = this.user ? this.user.roles : [];
        console.log(roles);
        if (test.includes("bank_agent")) {
            this.layout = "material";
        } else if (test.includes("cnss_officer")) {
            this.layout = "classy";
        } else if (test.includes("cnss_agent")) {
            this.layout = "futuristic";
        } else {
            this.layout = "dense";
        }
        } catch (e) {
            this.layout = "material";
            console.error('Error parsing roles from sessionStorage:', e);

// Fallback to an empty array in case of parsing error
        }
        const layoutFromQueryParam = route.snapshot.queryParamMap.get('layout');
        if (layoutFromQueryParam) {
            this.layout = layoutFromQueryParam;
            if (this.config) {
                this.config.layout = layoutFromQueryParam;
            }
        }

        const paths = route.pathFromRoot;
        paths.forEach((path) => {
            if (path.routeConfig && path.routeConfig.data && path.routeConfig.data.layout) {
                this.layout = path.routeConfig.data.layout;
            }
        });
    }

    private _updateScheme(): void {
        this._document.body.classList.remove('light', 'dark');
        this._document.body.classList.add(this.scheme);
    }

    private _updateTheme(): void {
        this._document.body.classList.forEach((className: string) => {
            if (className.startsWith('theme-')) {
                this._document.body.classList.remove(className, className.split('-')[1]);
            }
        });
        this._document.body.classList.add(this.theme);
    }
}
