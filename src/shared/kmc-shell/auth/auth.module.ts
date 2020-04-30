import { ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthCanActivate } from './auth-can-activate.service';
import { AppAuthentication } from './app-authentication.service';
import { AppBootstrap } from './app-bootstrap.service';
import { InvalidKsInterceptorService } from './invalid-ks-interceptor.service';

@NgModule({
    imports: [

    ],
    declarations: [
    ],
    providers: [
        AuthCanActivate,
        AppBootstrap,
        AppAuthentication,
    ]
})
export class AuthModule {
    constructor() {
    }

    static forRoot(): ModuleWithProviders<AuthModule> {
        return {
            ngModule: AuthModule,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: InvalidKsInterceptorService,
                    multi: true
                }
            ]
        };
    }
}

