import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-default-view',
    templateUrl: './app-default-view.component.html',
    styleUrls: ['./app-default-view.component.scss'],
    providers: [
    ],
})
export class AppDefaultViewComponent {
    constructor(
        private router: Router,
    ) {
        this.navigateToDefault();
    }

    navigateToDefault(){
        this.router.navigateByUrl('/');
    }
}
