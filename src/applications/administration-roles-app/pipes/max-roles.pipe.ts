import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'app-environment';


@Pipe({name: 'kMaxRoles'})
export class MaxRolesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
  	const maxroles = environment.rolesShared.MAX_ROLES;
    return value >  maxroles ? maxroles : value;
  }
}
