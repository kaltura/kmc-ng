import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsAccountSettingsComponent} from './settings-account-settings.component';
import {routing} from "./settings-account-settings-app.routes";
import {RouterModule} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule
  ],
  declarations: [SettingsAccountSettingsComponent]
})
export class SettingsAccountSettingsAppModule { }
