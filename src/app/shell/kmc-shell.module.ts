import { NgModule, Injectable } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';

import { AppMenuService } from './services/app-menu.service';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { UploadComponent } from './components/upload/upload.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';

import * as R from 'ramda';


@NgModule({
  imports:      [
    CommonModule,
    KalturaCommonModule,
    RouterModule.forChild([]),
    ],
  declarations: [
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    ErrorComponent,
    UploadComponent,
    UserSettingsComponent
    ],
  exports: [DashboardComponent,LoginComponent ],
  providers:    [
    AppMenuService
  ]
})
export class KMCShellAppModule {

}
