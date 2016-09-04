import { NgModule }           from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule }       from '@angular/common';

import { DashboardComponent } from "./components/dashboard/dashboard.component";
import {AppMenuComponent} from "./components/app-menu/app-menu.component";
import {LanguageMenuComponent} from "./components/language-menu/language-menu.component";
import {LoginComponent} from "./components/login/login.component";
import {UploadComponent} from "./components/upload/upload.component";
import {UserSettingsComponent} from "./components/user-settings/user-settings.component";

@NgModule({
  imports:      [ CommonModule, RouterModule.forChild([]) ],
  declarations: [ DashboardComponent, AppMenuComponent, LanguageMenuComponent, LoginComponent, UploadComponent, UserSettingsComponent ],
  exports: [DashboardComponent,LoginComponent ],
  providers:    []
})
export class KMCShellAppModule { }
