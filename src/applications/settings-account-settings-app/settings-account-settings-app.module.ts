import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAccountSettingsComponent} from './settings-account-settings.component';
import {routing} from "./settings-account-settings-app.routes";
import {RouterModule} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {ButtonModule, DropdownModule, InputTextModule} from "primeng/primeng";
import {AreaBlockerModule} from "@kaltura-ng/kaltura-ui";
import {TranslateModule} from "ng2-translate";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    AreaBlockerModule,
    TranslateModule
  ],
  declarations: [SettingsAccountSettingsComponent]
})
export class SettingsAccountSettingsAppModule {
}
