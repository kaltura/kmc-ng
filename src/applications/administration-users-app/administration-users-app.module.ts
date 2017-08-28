import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './administration-users-app.routes';
import { AdministrationUsersComponent } from './administration-users.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
        AdministrationUsersComponent
    ],
    exports: [],
    providers: []
})
export class AdministrationUsersAppModule {}
