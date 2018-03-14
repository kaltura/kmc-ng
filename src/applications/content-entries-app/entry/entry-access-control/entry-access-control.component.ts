import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlWidget } from './entry-access-control-widget.service';
import { AppPermissionsService } from '@kaltura-ng/mc-shared/app-permissions/app-permissions.service';


@Component({
    selector: 'kEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;
	public _canSetAccessControl = false;

	constructor(public _widgetService: EntryAccessControlWidget,
              private _permissionsService: AppPermissionsService) {
	}


	ngOnInit() {
        this._widgetService.attachForm();
    this._canSetAccessControl = this._permissionsService.hasPermission('CONTENT_MANAGE_ACCESS_CONTROL');
	}

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}

