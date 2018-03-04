import { Pipe, PipeTransform } from '@angular/core';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';

@Pipe({ name: 'kRoleName' })
export class RoleNamePipe implements PipeTransform {
  constructor() {
  }

  transform(userId: number, roles: KalturaUserRole[]): string {
    let userRoleName = '';

    if (typeof userId !== 'undefined' && userId !== null && roles != null) {
      const userRole = roles.find(role => userId === role.id);
      if (userRole) {
        userRoleName = userRole.name;
      }
    }
    return userRoleName;
  }
}
