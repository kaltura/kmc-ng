import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { kmcAppConfig } from '../../../kmc-app/kmc-app-config';

@Injectable()
export class AppNavigator {
    constructor(private router: Router) {
    }

    public navigateToLogin(): void {
        this.router.navigateByUrl('/login');
    }

    public navigateToDefault(extras?: NavigationExtras): void {
        this.router.navigateByUrl('/', extras);
    }

    public navigateToError(): void {
        this.router.navigateByUrl(kmcAppConfig.routing.errorRoute);
    }

    public navigate(path: string): void {
        this.router.navigateByUrl(path);
    }
}
