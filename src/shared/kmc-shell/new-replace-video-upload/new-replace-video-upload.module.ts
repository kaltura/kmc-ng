import { ModuleWithProviders, NgModule } from '@angular/core';
import { NewReplaceVideoUploadService } from './new-replace-video-upload.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class NewReplaceVideoUploadModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NewReplaceVideoUploadModule,
      providers: <any[]>[
        NewReplaceVideoUploadService
      ]
    };
  }
}
