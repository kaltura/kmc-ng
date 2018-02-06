import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AppAuthentication } from './app-authentication.service';
import { modulesConfig } from 'config/modules';

@Injectable()
export class AppNavigator {

    constructor(private router: Router, private appAuthentication: AppAuthentication) {
    }


    navigateToLogin(){
        this.router.navigateByUrl('/login');
    }
    navigateToDefault(){
        this.router.navigateByUrl('/');
    }
    navigateToError(){
        this.router.navigateByUrl(modulesConfig.shell.browser.errorRoute);
    }
    navigate(path: string){
        this.router.navigateByUrl(path);
    }

};