import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { AppAuthentication } from './app-authentication.service';
import { kmcAppConfig } from '../../../kmc-app/kmc-app-config';

@Injectable()
export class AppNavigator {

    constructor(private router: Router, private appAuthentication: AppAuthentication) {
    }


    navigateToLogin(){
        this.router.navigateByUrl('/login');
    }
    navigateToDefault(extras?: NavigationExtras): void {
        this.router.navigateByUrl('/', extras);
    }
    navigateToError(){
        this.router.navigateByUrl(kmcAppConfig.routing.errorRoute);
    }
    navigate(path: string){
        this.router.navigateByUrl(path);
    }

};
