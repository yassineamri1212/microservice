import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

import {AuthSignOutComponent} from "./modules/auth/sign-out/sign-out.component";
import {EmptyLayoutComponent} from "./layout/layouts/empty/empty.component";
import {LoginComponent} from "./authentification/login/login.component";
import {ChatbotComponent} from "./chatbot/chatbot.component";

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [


    // Redirect empty path to '/example'


    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: '', pathMatch : 'full', redirectTo: 'acceuil'},

            {path: 'logintest', component: LoginComponent},

            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'verify-code', loadChildren: () => import('app/modules/auth/verify-code/verify-code.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')},
            {path: 'acceuil', loadChildren: () => import('app/defaultpage/defaultpage.routes')},

        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},

        ]
    },

    // Admin routes
    {


        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            //STUDENT ROUTES HEEEEEREEEEEEEEEE

            {path: 'editrole/:userId', loadChildren: () => import('app/User/dashboard/edituserrole/edituserrole.routes')},

            {path: 'profile', loadChildren: () => import('app/User/profile/profileroute.routes')},
            {path: 'bankacounts', loadChildren: () => import('app/bank-acounts/bankaccounts.routes')},
            {path: 'reservations', loadChildren: () => import('app/reservation/reservation.routes')},
            {path: 'reservations/:reservationId', loadChildren: () => import('app/reservation/showreservation/showreservation.routes')},
            {path: 'checkreservation', loadChildren: () => import('app/reservation/checkreservation/checkreservation.routes')},
            {path: 'paymentrequest', loadChildren: () => import('app/cnssrequest/cnssrequest.routes')},
            {path: 'usernotification', loadChildren: () => import('app/usernotification/usernotification.routes')},
            {path: 'signandgo', loadChildren: () => import('app/signature-pad/signaturepad.routes')},




            {path: 'messenger', loadChildren: () => import('app/messenger/messenger.routes')},


            {path: 'meetingscalendar', loadChildren: () => import('app/meetapp/meeting-calendar/meetcalendar.routes')},

            {path: 'meetings/:roomName', loadChildren: () => import('app/meetapp/meet/meet.routes')},


            {path: 'User', children: [
                    {path: 'edituser', loadChildren: () => import('app/User/edituser/edituser.routes')},
                    {path: 'adduser', loadChildren: () => import('app/adduser/adduser.routes')},
                    {path: 'dashboard/show-users', loadChildren: () => import('app/User/dashboard/showusers/showusers.routes')},

                ]},

            {path: 'apps', children: [

                    {path: 'scrumboard', loadChildren: () => import('app/modules/admin/scrumboard/scrumboard.routes')},
                ]},
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
        ]
    }





];
