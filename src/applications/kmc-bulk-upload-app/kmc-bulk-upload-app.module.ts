import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { routing } from './kmc-bulk-upload-app.routes';
import { BulkUploadButtonComponent } from './bulk-upload-button/bulk-upload-button.component';
import { BulkUploadMenuComponent } from './bulk-upload-menu/bulk-upload-menu.component';
import { CommonModule } from '@angular/common';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaServerModule } from '@kaltura-ng/kaltura-server-utils';
import { ButtonModule } from 'primeng/primeng';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    PopupWidgetModule,
    KalturaCommonModule,
    KalturaServerModule,
    KalturaUIModule,
    ButtonModule
  ],
  declarations: [
    BulkUploadMenuComponent,
    BulkUploadButtonComponent
  ],
  exports: [
    BulkUploadButtonComponent
  ],
  providers: [],
})
export class KmcBulkUploadAppModule {
}
