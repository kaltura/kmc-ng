import { ModuleWithProviders, NgModule } from '@angular/core';
import { NewEntryUploadService } from './new-entry-upload.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class NewEntryUploadModule {

  static forRoot(): ModuleWithProviders<NewEntryUploadModule> {
    return {
      ngModule: NewEntryUploadModule,
      providers: [
        NewEntryUploadService
      ]
    };
  }
}
