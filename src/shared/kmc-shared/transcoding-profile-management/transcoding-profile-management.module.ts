import { ModuleWithProviders, NgModule } from '@angular/core';
import { KalturaClientModule } from '@kaltura-ng/kaltura-client';
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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: TranscodingProfileManagementModule,
      providers: <any[]>[
        TranscodingProfileManagement
      ]
    };
  }
}
