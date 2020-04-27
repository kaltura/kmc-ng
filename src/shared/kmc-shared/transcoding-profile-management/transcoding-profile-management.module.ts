import { ModuleWithProviders, NgModule } from '@angular/core';
import { KalturaClientModule } from 'kaltura-ngx-client';
import { TranscodingProfileManagement } from './transcoding-profile-management.service';

@NgModule({
  imports: <any[]>[
    KalturaClientModule,
  ],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class TranscodingProfileManagementModule {
  static forRoot(): ModuleWithProviders<TranscodingProfileManagementModule> {
    return {
      ngModule: TranscodingProfileManagementModule,
      providers: <any[]>[
        TranscodingProfileManagement
      ]
    };
  }
}
