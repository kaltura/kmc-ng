import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AppAuthentication } from './app-authentication.service';

@Injectable()
export class AppNavigator {

    constructor(private router: Router, private appAuthentication: AppAuthentication) {
    }

    navigateToLogin(){
        this.router.navigateByUrl(this.appAuthentication.defaultRoutes.loginRoute);
    }
    navigateToDefault(){
        this.router.navigateByUrl(this.appAuthentication.defaultRoutes.defaultRoute);
    }
    navigateToError(){
        this.router.navigateByUrl(this.appAuthentication.defaultRoutes.errorRoute);
    }
    navigateToLogout(){
        this.router.navigateByUrl(this.appAuthentication.defaultRoutes.loginRoute);
    }
    navigate(path: string){
        this.router.navigateByUrl(path);
    }

};