import { Component, OnInit, OnDestroy } from '@angular/core';
import { DocumentAccessControlWidget } from './document-access-control-widget.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';


@Component({
    selector: 'kDocumentAccessControl',
    templateUrl: './document-access-control.component.html',
    styleUrls: ['./document-access-control.component.scss']
})
export class DocumentAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;
	public _canSetAccessControl = false;
    public _kmcPermissions = KMCPermissions;

	constructor(public _widgetService: DocumentAccessControlWidget,
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

