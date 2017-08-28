import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './administration-roles-app.routes';
import { AdministrationRolesComponent } from './administration-roles.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
        AdministrationRolesComponent
    ],
    exports: [],
    providers: []
})
export class AdministrationRolesAppModule {}
