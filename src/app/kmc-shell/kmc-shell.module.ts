import { NgModule, Injectable } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule }       from '@angular/common';
import { KMCngCoreModule, AppStorage } from '@kaltura/kmcng-core';
import { KalturaApiModule } from '@kaltura/kaltura-api';
import { KMCngShellCoreModule } from '@kaltura/kmcng-shell';
import { GetConfigPostLoadProvider, PostLoadAdapter } from '@kaltura/kmcng-core';
import { KalturaAPIConfig } from '@kaltura/kaltura-api';
import { NG2_WEBSTORAGE } from 'ng2-webstorage';

import { DashboardComponent } from "./components/dashboard/dashboard.component";
import {AppMenuComponent} from "./components/app-menu/app-menu.component";
import {LanguageMenuComponent} from "./components/language-menu/language-menu.component";
import {LoginComponent} from "./components/login/login.component";
import {UploadComponent} from "./components/upload/upload.component";
import {UserSettingsComponent} from "./components/user-settings/user-settings.component";
import { BrowserService } from '@kaltura/kmcng-shell';

@Injectable()
class KalturaAPIConfigConfigAdapter implements PostLoadAdapter
{
  constructor(private kalturaAPIConfig : KalturaAPIConfig){

  }
  execute(config : any) : void{
    // TODO [kmc] handle error scenarios (missing core.kaltura)
    const { apiUrl, apiVersion }  = config.core.kaltura;
    const kalturaAPIConfig  = this.kalturaAPIConfig;
    kalturaAPIConfig.apiUrl = apiUrl;
    kalturaAPIConfig.apiVersion = apiVersion;
  }
}

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
    GetConfigPostLoadProvider(KalturaAPIConfigConfigAdapter),
    NG2_WEBSTORAGE
  ]
})
export class KMCShellAppModule { }
