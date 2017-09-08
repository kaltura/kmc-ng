import { Pipe, PipeTransform } from '@angular/core';
import { KalturaUserRole } from 'kaltura-typescript-client/types/KalturaUserRole';

@Pipe({name: 'roleName'})
export class RoleNamePipe implements PipeTransform {
	constructor() {}

	transform(userId: string, roles: KalturaUserRole[]): string {
		let userRoleName: string = '';

    if (typeof userId !== 'undefined' && userId !== null) {
      roles.forEach(role => {
        if(userId === role.id.toString()) {
          userRoleName = role.name;
        }
      });
    }
		return userRoleName;
	}
}
