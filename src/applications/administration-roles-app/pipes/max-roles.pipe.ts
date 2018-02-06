import { Pipe, PipeTransform } from '@angular/core';
import { subApplicationsConfig } from 'config/sub-applications';


@Pipe({ name: 'kMaxRoles' })
export class MaxRolesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
    const maxroles = subApplicationsConfig.rolesShared.MAX_ROLES;
    return value > maxroles ? maxroles : value;
  }
}
