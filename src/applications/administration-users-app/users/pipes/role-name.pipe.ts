import { Pipe, PipeTransform } from '@angular/core';
import { KalturaUserRole } from 'kaltura-ngx-client';

@Pipe({ name: 'kRoleName' })
export class RoleNamePipe implements PipeTransform {
  constructor() {
  }

  transform(userId: string, roles: KalturaUserRole[]): string {
    let userRoleName: string = '';

    if (typeof userId !== 'undefined' && userId !== null && roles != null) {
      let role = roles.find(role => userId === role.id.toString());
      if (role) {
        userRoleName = role.name;
      }
    }
    return userRoleName;
  }
}
