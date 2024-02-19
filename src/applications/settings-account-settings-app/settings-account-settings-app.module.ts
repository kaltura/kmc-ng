import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAccountSettingsComponent} from './settings-account-settings.component';
import {routing} from "./settings-account-settings-app.routes";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AreaBlockerModule, TooltipModule, InputHelperModule, PopupWidgetModule} from '@kaltura-ng/kaltura-ui';
import {TranslateModule} from "@ngx-translate/core";
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { SettingsAccountSettingsCanDeactivateService } from './settings-account-settings-can-deactivate.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from '@kaltura-ng/kaltura-primeng-ui';
import { SsoConfigComponent } from "./sso-config/sso-config.component";
import { ProfilesStoreService } from "../settings-authentication-app/profiles-store/profiles-store.service";
import { EpSsoConfigComponent } from './ep-sso-config/ep-sso-config.component';
import {InputSwitchModule} from 'primeng/inputswitch';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        MultiSelectModule,
        InputTextModule,
        TooltipModule,
        ButtonModule,
        AreaBlockerModule,
        InputHelperModule,
        TranslateModule,
        KMCPermissionsModule,
        InputSwitchModule,
        PopupWidgetModule
    ],
  declarations: [SettingsAccountSettingsComponent, SsoConfigComponent, EpSsoConfigComponent],
    providers:[SettingsAccountSettingsCanDeactivateService, ProfilesStoreService]
})
export class SettingsAccountSettingsAppModule {
}
