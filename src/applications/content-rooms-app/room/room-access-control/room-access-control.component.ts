import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomAccessControlWidget } from './room-access-control-widget.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';


@Component({
    selector: 'kRoomAccessControl',
    templateUrl: './room-access-control.component.html',
    styleUrls: ['./room-access-control.component.scss']
})
export class RoomAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;
	public _canSetAccessControl = false;
    public _kmcPermissions = KMCPermissions;

	constructor(public _widgetService: RoomAccessControlWidget,
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

