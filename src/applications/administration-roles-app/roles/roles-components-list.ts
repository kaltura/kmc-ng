import {RolesTableComponent} from './roles-table.component';
import {RolesListComponent} from './roles-list.component';
import {MaxRolesPipe} from '../pipes/max-roles.pipe';
import {PrimeTableSortDirectionPipe} from '../pipes/prime-table-sort-direction.pipe';

export const RolesComponentsList = [
  RolesListComponent,
  RolesTableComponent,
  MaxRolesPipe,
  PrimeTableSortDirectionPipe
];
