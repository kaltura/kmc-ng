import {Component} from '@angular/core';
import {RolesService} from "./roles/roles.service";

@Component({
  selector: 'kRoles',
  templateUrl: './administration-roles.component.html',
  styleUrls: ['./administration-roles.component.scss'],
  providers: [RolesService]
})

export class AdministrationRolesComponent {
}
