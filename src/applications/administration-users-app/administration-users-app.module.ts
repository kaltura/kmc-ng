import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './administration-users-app.routes';
import { AdministrationUsersComponent } from './administration-users.component';
import { UsersComponentsList } from './users/users-components-list';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
        AdministrationUsersComponent,
        UsersComponentsList
    ],
    exports: [],
    providers: []
})
export class AdministrationUsersAppModule {}
