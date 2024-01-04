import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { DocumentSchedulingWidget } from './document-scheduling-widget.service';

import { subApplicationsConfig } from 'config/sub-applications';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
    selector: 'kDocumentScheduling',
    templateUrl: './document-scheduling.component.html',
    styleUrls: ['./document-scheduling.component.scss']
})
export class DocumentScheduling implements AfterViewInit, OnInit, OnDestroy {
    public _kmcPermissions = KMCPermissions;
    public _loading = false;
    public _loadingError = null;

	_enableEndDate: boolean;

	public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;

    constructor(
        public _widgetService: DocumentSchedulingWidget
	) {}


    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }


    ngAfterViewInit() {

    }
}

