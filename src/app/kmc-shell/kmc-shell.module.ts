import { NgModule, Injectable } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule }       from '@angular/common';
import { KMCngCoreModule, AppStorage } from '@kaltura/kmcng-core';
import { KalturaApiModule } from '@kaltura/kaltura-api';
import { KMCngShellCoreModule } from '@kaltura/kmcng-shell';
import { GetConfigPostLoadProvider } from '@kaltura/kmcng-core';
import { NG2_WEBSTORAGE } from 'ng2-webstorage';

import { DashboardComponent } from "./components/dashboard/dashboard.component";
import {AppMenuComponent} from "./components/app-menu/app-menu.component";
import {LanguageMenuComponent} from "./components/language-menu/language-menu.component";
import {LoginComponent} from "./components/login/login.component";
import {UploadComponent} from "./components/upload/upload.component";
import {UserSettingsComponent} from "./components/user-settings/user-settings.component";
import { BrowserService } from '@kaltura/kmcng-shell';

import { KalturaAPIConfigAdapter } from './shared/kaltura-api-config-adapter.service';

@NgModule({
  imports:      [
    CommonModule,
    KMCngShellCoreModule,
    RouterModule.forChild([]),
    BrowserModule,
    HttpModule,
    KMCngCoreModule,
    KalturaApiModule,
    ],
  declarations: [
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    UploadComponent,
    UserSettingsComponent ],
  exports: [DashboardComponent,LoginComponent ],
  providers:    [
    GetConfigPostLoadProvider(KalturaAPIConfigAdapter),
    NG2_WEBSTORAGE
  ]
})
export class KMCShellAppModule { }
