

import { Pipe } from '@angular/core';
import { KMCPermissionsService } from './kmc-permissions.service';
import { ActionPermittedPipeBase, Modes } from '@kaltura-ng/mc-shared';
import { KMCPermissions } from './kmc-permissions';

@Pipe({ name: 'kNgIfPermitted' })
export class NgIfPermittedPipe extends ActionPermittedPipeBase<KMCPermissions> {
    constructor(private _service: KMCPermissionsService) {
        super(Modes.AllowIfAnyExists);
    }

    protected hasAnyPermissions(permissionList: KMCPermissions[]): boolean {
        return this._service.hasAnyPermissions(permissionList);
    }
}
