import { ModuleWithProviders, NgModule } from '@angular/core';
import { NewEntryUploadService } from './new-entry-upload.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class NewEntryUploadModule {

  static forRoot(): ModuleWithProviders<NewEntryUploadModule> {
    return {
      ngModule: NewEntryUploadModule,
      providers: <any[]>[
        NewEntryUploadService
      ]
    };
  }
}
