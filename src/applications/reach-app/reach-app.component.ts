import { Component } from '@angular/core';
import { ContentReachMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { ReachPages } from 'app-shared/kmc-shared/reach/reach-frame.component';

@Component({
    selector: 'kReachApp',
    templateUrl: './reach-app.component.html',
    styleUrls: ['./reach-app.component.scss']
})
export class ReachAppComponent {
    public _enabled = false;
    public _dashboardPage = ReachPages.dashboard;

    constructor(reachView: ContentReachMainViewService) {
        this._enabled = reachView.viewEntered();
    }
}
