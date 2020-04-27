import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { TranscodingProfileCreationService } from './transcoding-profile-creation.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class TranscodingProfileCreationModule {
  static forRoot(): ModuleWithProviders<TranscodingProfileCreationModule> {
    return {
      ngModule: TranscodingProfileCreationModule,
      providers: [TranscodingProfileCreationService]
    };
  }

  constructor(@Optional() @Self() transcodingProfileCreationService: TranscodingProfileCreationService) {
    if (transcodingProfileCreationService) {
      transcodingProfileCreationService.init();
    }
  }
}
