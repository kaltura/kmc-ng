import { ModuleWithProviders, NgModule } from '@angular/core';
import { NewReplaceVideoUploadService } from './new-replace-video-upload.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class NewReplaceVideoUploadModule {

  static forRoot(): ModuleWithProviders<NewReplaceVideoUploadModule> {
    return {
      ngModule: NewReplaceVideoUploadModule,
      providers: [
        NewReplaceVideoUploadService
      ]
    };
  }
}
