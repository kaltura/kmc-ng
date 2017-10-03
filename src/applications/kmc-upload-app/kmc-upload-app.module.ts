import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, KalturaUIModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {
  ButtonModule,
  CheckboxModule,
  DataTableModule,
  DropdownModule,
  InputSwitchModule,
  InputTextModule,
  MenuModule,
  SharedModule
} from 'primeng/primeng';
import {KalturaCommonModule} from '@kaltura-ng/kaltura-common';
import {KalturaPrimeNgUIModule} from '@kaltura-ng/kaltura-primeng-ui';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';

import {UploadMenuComponent} from './upload-menu/upload-menu.component';
import {UploadSettingsComponent} from './upload-settings/upload-settings.component';
import {UploadButtonComponent} from './upload-button/upload-button.component';
import {ManualLiveComponent} from './create-live/manual-live/manual-live.component';
import {UniversalLiveComponent} from './create-live/universal-live/universal-live.component';
import {TranscodingProfileSelectComponent} from './prepare-entry/transcoding-profile-select/transcoding-profile-select.component';
import {CreateLiveComponent} from './create-live/create-live.component';
import {KalturaLiveStreamComponent} from './create-live/kaltura-live-stream/kaltura-live-stream.component';
import {PrepareEntryService} from './prepare-entry/prepare-entry.service';
import {PrepareEntryComponent} from './prepare-entry/prepare-entry.component';
import {KalturaLiveStreamService} from "./create-live/kaltura-live-stream/kaltura-live-stream.service";
import {UniversalLiveService} from "./create-live/universal-live/universal-live.service";

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
    SharedModule,
    InputSwitchModule,
    CheckboxModule
  ],
  declarations: [
    UploadMenuComponent,
    UploadSettingsComponent,
    UploadButtonComponent,
    PrepareEntryComponent,
    TranscodingProfileSelectComponent,
    CreateLiveComponent,
    KalturaLiveStreamComponent,
    UniversalLiveComponent,
    ManualLiveComponent
  ],
  exports: [
    UploadButtonComponent
  ],
  providers: [
    PrepareEntryService,
    KalturaLiveStreamService,
    UniversalLiveService
  ]
})
export class KmcUploadAppModule {
}
