import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import {
  DataTableModule,
  ButtonModule,
  InputTextModule,
  MenuModule,
  SharedModule,
  DropdownModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { KalturaUIModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';

import { UploadMenuComponent } from './upload-menu/upload-menu.component';
import { UploadSettingsComponent } from './upload-settings/upload-settings.component';
import { KmcUploadAppService } from './kmc-upload-app.service';
import { UploadButtonComponent } from './upload-button/upload-button.component';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
    KalturaCommonModule,
    KalturaUIModule,
    TooltipModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    PopupWidgetModule,
    MenuModule,
    KalturaPrimeNgUIModule,
    SharedModule
  ],
  declarations: [
    UploadMenuComponent,
    UploadSettingsComponent,
    UploadButtonComponent
  ],
  exports: [
    UploadButtonComponent
  ],
  providers: [
    KmcUploadAppService
  ]
})
export class KmcUploadAppModule {
}
