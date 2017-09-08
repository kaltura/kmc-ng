import { UsersTableComponent } from './users-table.component';
import { StatusPipe } from '../pipes/status.pipe';
import { FullNamePipe } from '../pipes/full-name.pipe';
import { RoleNamePipe } from '../pipes/role-name.pipe';

export const UsersComponentsList = [
  UsersTableComponent,
  StatusPipe,
  FullNamePipe,
  RoleNamePipe
];
