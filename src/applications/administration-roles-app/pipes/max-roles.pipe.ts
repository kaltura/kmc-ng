import { Pipe, PipeTransform } from '@angular/core';
import { modulesConfig } from 'config/modules';


@Pipe({ name: 'kMaxRoles' })
export class MaxRolesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
    const maxroles = modulesConfig.rolesShared.MAX_ROLES;
    return value > maxroles ? maxroles : value;
  }
}
