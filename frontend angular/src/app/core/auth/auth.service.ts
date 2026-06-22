import { Injectable } from '@angular/core';
import { environment } from '../../../keycloak-config';
import Keycloak from 'keycloak-js';
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthUtils } from './auth.utils';
import { User } from '../user/user.types';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from "@angular/common/http";
import { UserService } from "../../user.service";
import { Usertype } from "../../Model/usertype";
import { Role } from "../../Model/role";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private keycloakAuth: Keycloak;
    private _authenticated: boolean = false;
    private currentUserProfile = new BehaviorSubject<User | null>(null);

    constructor(private router: Router, private httpClient: HttpClient, private userService: UserService) {
        this.keycloakAuth = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId,
        });

        // Initialize Keycloak
        this.keycloakAuth.init({ onLoad: 'check-sso' }).then((authenticated) => {
            this._authenticated = authenticated;
            if (authenticated) {
                this.keycloakAuth.loadUserInfo().then((userInfo: User) => {
                    const user: User = {
                        name: userInfo.name,
                        role: AuthUtils.decodeToken(this.keycloakAuth.token).resource_access.angular.roles,
                        id: '1', // Mock ID; replace with real ID from your API
                        email: userInfo.email
                    };
                    this.currentUserProfile.next(user);
                });
            }
        });
    }

    // Getter for the access token
    get accessToken(): string {
        return this.keycloakAuth.token;
    }
    getAdminToken(): Observable<string> {
        const url = `http://localhost:8086/realms/esprit/protocol/openid-connect/token`;
        const body = new HttpParams()
            .set('grant_type', 'password')
            .set('client_id', 'angular')
            .set('client_secret', 'ZYI3nVy3Aj9nGbT4RiyCZlhzhBDqzxd5') // We'll update this
            .set('username', 'admin')
            .set('password', 'admin');

        return this.httpClient.post<any>(url, body.toString(), {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).pipe(map(response => response.access_token));
    }


    getCurrentUserProfile(): Observable<User | null> {
        return this.currentUserProfile.asObservable();
    }
    resetPassword(userId: string, newPassword: string): Observable<any> {
        const url = `http://localhost:8086/admin/realms/esprit/users/${userId}/reset-password`;

        return this.getAdminToken().pipe(
            switchMap((adminToken) =>
                this.httpClient.put(
                    url,
                    {
                        type: 'password',
                        value: newPassword,
                        temporary: false
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            ),
            catchError((error) => {
                console.error('Failed to reset password:', error);
                return throwError(() => new Error('Failed to reset password'));
            })
        );
    }

    sendResetPasswordEmail(userId: string): Observable<any> {
        const url = `http://localhost:8086/admin/realms/esprit/users/${userId}/execute-actions-email`;

        return this.getAdminToken().pipe(
            switchMap((adminToken) =>
                this.httpClient.put(
                    url,
                    ['UPDATE_PASSWORD'], // Action for resetting the password
                    {
                        headers: {
                            Authorization: `Bearer ${adminToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                )
            ),
            catchError((error) => {
                console.error('Failed to send reset password email:', error);
                // Persist error to localStorage for debugging
                localStorage.setItem('lastResetError', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    error: error.message,
                    status: error.status,
                    url: error.url,
                    details: error.error
                }));
                return throwError(() => new Error('Failed to send reset password email'));
            })
        );
    }

    // Sign in
    signIn(email: string, password: string): Observable<any> {
        const url = `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;
        const body = new URLSearchParams();
        body.set('client_id', environment.keycloak.clientId);
        body.set('username', email);
        body.set('password', password);
        body.set('grant_type', 'password');

        return this.httpClient.post<any>(url, body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).pipe(
            catchError((error) => {
                console.error('Error while authenticating with Keycloak:', error);
                return throwError(() => new Error('Failed to retrieve authentication token'));
            }),
            switchMap((response) => {
                console.log('Keycloak response:', response);

                // Ensure the access token is present
                const accessToken = response.access_token;
                if (!accessToken) {
                    console.error('Access token is missing in the response');
                    return throwError(() => new Error('Access token is missing in the response'));
                }

                // Decode the token to extract the roles
                const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));

                // Dynamically access the roles using the client_id
                const clientRoles = decodedToken.resource_access?.[environment.keycloak.clientId]?.roles || [];
                console.log(`${environment.keycloak.clientId} roles:`, clientRoles);

                // Store the access token and the decoded roles in sessionStorage
                sessionStorage.setItem('access_token', accessToken);

                sessionStorage.setItem('roles', JSON.stringify(clientRoles)); // Save roles specific to the client

                // Fetch user details by email (use a service method to get user details)
                return this.userService.getUserByEmail(email).pipe(
                    switchMap((user: Usertype) => {
                        // Save user details (like ID and full name)
                        console.log(user.attributes+"thiiisisis");

                        sessionStorage.setItem('userId', user.id); // Save user ID
                        sessionStorage.setItem('firstName', user.firstName); // Save full name or other details
                        sessionStorage.setItem('lastName', user.lastName); // Save full name or other details

                        sessionStorage.setItem('username', user.username);
                        sessionStorage.setItem('email', user.email);
                        if (user.attributes) {
                            // Check if phoneNumber is an array and join it if necessary
                            const phoneNumber = Array.isArray(user.attributes.phoneNumber) ? user.attributes.phoneNumber.join(', ') : user.attributes.phoneNumber;
                            const address = Array.isArray(user.attributes.address) ? user.attributes.address.join(', ') : user.attributes.address;
                            const age = Array.isArray(user.attributes.age) ? user.attributes.age.join(', ') : user.attributes.age;
                            const avatar = Array.isArray(user.attributes.avatar) ? user.attributes.avatar.join(', ') : user.attributes.avatar;

                            sessionStorage.setItem('avatar', avatar || '');

                            // Save them as strings
                            sessionStorage.setItem('phoneNumber', phoneNumber || '');
                            sessionStorage.setItem('address', address || '');
                            sessionStorage.setItem('age', age || '');
                        }
                        // Get roles for the user and store them in sessionStorage
                        return this.userService.getRolesForUser(user.id).pipe(
                            tap((roles: Role[]) => {
                                // Save user roles if different from the roles fetched initially
                                sessionStorage.setItem('user_roles', JSON.stringify(roles));
                            }),

                            // Return the access token as the final result
                            map(() => accessToken) // Return the access token as the observable result
                        );
                    })
                );
            })
        );
    }

    // Sign out
    signOut(): Observable<any> {
        return from(this.keycloakAuth.logout().then(() => {
            this._authenticated = false;
            this.router.navigate(['/sign-in']);
        }));
    }

    // Check authentication status
    check(): Observable<boolean> {
        return of(this._authenticated);
    }

    // To check if the user is logged in
    isLoggedIn(): boolean {
        return sessionStorage.getItem('access_token') !== null;
    }

    // To retrieve the stored user roles
    getUserRoles(): string[] {
        const roles = sessionStorage.getItem('roles');
        return roles ? JSON.parse(roles) : [];
    }


}
