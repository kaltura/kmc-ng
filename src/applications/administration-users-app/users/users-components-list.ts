import { UsersTableComponent } from './users-table.component';
import { StatusPipe } from '../pipes/status.pipe';
import { FullNamePipe } from '../pipes/full-name.pipe';
import { RoleNamePipe } from '../pipes/role-name.pipe';
import { UsersListComponent } from './users-list.component';

export const UsersComponentsList = [
  UsersTableComponent,
  StatusPipe,
  FullNamePipe,
  RoleNamePipe,
  UsersListComponent
];
