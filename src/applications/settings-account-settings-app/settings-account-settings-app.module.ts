import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAccountSettingsComponent} from './settings-account-settings.component';
import {routing} from "./settings-account-settings-app.routes";
import {RouterModule} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {AreaBlockerModule} from "@kaltura-ng/kaltura-ui";
import {TranslateModule} from "@ngx-translate/core";
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { SettingsAccountSettingsCanDeactivateService } from './settings-account-settings-can-deactivate.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule,
    KMCPermissionsModule
  ],
  declarations: [SettingsAccountSettingsComponent],
    providers:[SettingsAccountSettingsCanDeactivateService]
})
export class SettingsAccountSettingsAppModule {
}
