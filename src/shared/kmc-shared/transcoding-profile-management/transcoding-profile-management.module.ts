import { ModuleWithProviders, NgModule } from '@angular/core';
import { KalturaClientModule } from 'kaltura-ngx-client';
import { TranscodingProfileManagement } from './transcoding-profile-management.service';

@NgModule({
  imports: [
    KalturaClientModule,
  ],
  declarations: [],
  exports: [],
  providers: []
})
export class TranscodingProfileManagementModule {
  static forRoot(): ModuleWithProviders<TranscodingProfileManagementModule> {
    return {
      ngModule: TranscodingProfileManagementModule,
      providers: [
        TranscodingProfileManagement
      ]
    };
  }
}
