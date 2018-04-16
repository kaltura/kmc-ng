import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlWidget } from './entry-access-control-widget.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';


@Component({
    selector: 'kEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;
	public _canSetAccessControl = false;
  public _kmcPermissions = KMCPermissions;

	constructor(public _widgetService: EntryAccessControlWidget,
              private _permissionsService: KMCPermissionsService) {
	}


	ngOnInit() {
        this._widgetService.attachForm();
    this._canSetAccessControl = this._permissionsService.hasAnyPermissions([KMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL]);
	}

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}

