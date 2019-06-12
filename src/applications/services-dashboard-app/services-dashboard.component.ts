import { Component, OnInit } from '@angular/core';
import { ServicesDashboardMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';

@Component({
    selector: 'kServicesDashboard',
    templateUrl: './services-dashboard.component.html',
    styleUrls: ['./services-dashboard.component.scss']
})
export class ServicesDashboardComponent implements OnInit {
    public _page = ReachPages.dashboard;
    public _loadFrame = false;

    constructor(private _servicesDashboardMainView: ServicesDashboardMainViewService) {
    }

    ngOnInit() {
        if (this._servicesDashboardMainView.viewEntered()) {
            this._loadFrame = true;
        }
    }
}
