import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsAccountSettingsComponent} from './settings-account-settings.component';
import {routing} from "./settings-account-settings-app.routes";
import {RouterModule} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {SettingsAccountSettingsService} from "./settings-account-settings.service";
import {DropdownModule} from "primeng/primeng";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule
  ],
  providers: [SettingsAccountSettingsService],
  declarations: [SettingsAccountSettingsComponent]
})
export class SettingsAccountSettingsAppModule { }
