import { NgModule } from '@angular/core';

import { AuthCanActivate } from './auth-can-activate.service';
import { AppNavigator } from './app-navigator.service';
import { AppAuthentication } from './app-authentication.service';
import { AppBootstrap } from './app-bootstrap.service';

@NgModule({
    imports: <any>[

    ],
    declarations: <any>[
    ],
    providers: <any>[
        AuthCanActivate,
        AppNavigator,
        AppBootstrap,
        AppAuthentication,
    ]
})
export class AuthModule {
    constructor(){
    }
}

