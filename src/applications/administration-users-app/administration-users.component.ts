import { Component } from '@angular/core';
import { UsersStore } from './users-store/users-store.service';

@Component({
    selector: 'kAdministrationUsers',
    templateUrl: './administration-users.component.html',
    styleUrls: ['./administration-users.component.scss'],
    providers : [UsersStore]
})
export class AdministrationUsersComponent  {
  constructor(public usersStore: UsersStore) {}
}

