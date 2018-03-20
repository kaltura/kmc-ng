import { Injectable } from '@angular/core';
import { AppPermissionsServiceBase } from '@kaltura-ng/mc-shared/app-permissions';
import { KMCPermissions } from './kmc-permissions';

@Injectable()
export class KMCPermissionsService extends AppPermissionsServiceBase<KMCPermissions> {

}