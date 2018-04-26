import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-default-view',
    template: '<div></div>',
    providers: [
    ],
})
export class AppDefaultViewComponent {
    constructor(
        private router: Router,
    ) {
        this.router.navigateByUrl('/');
    }
}
