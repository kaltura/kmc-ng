import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaServerModule } from '@kaltura-ng/kaltura-server-utils';
import { ButtonModule } from 'primeng/primeng';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { AuthModule } from 'app-shared/kmc-shell';
import { BulkUploadMenuComponent } from './bulk-upload-menu/bulk-upload-menu.component';
import { BulkUploadButtonComponent } from './bulk-upload-button/bulk-upload-button.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    AuthModule,
    CommonModule,
    PopupWidgetModule,
    KalturaCommonModule,
    KalturaServerModule,
    KalturaUIModule,
    ButtonModule,
    RouterModule
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
