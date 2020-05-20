import { ModuleWithProviders, NgModule } from '@angular/core';
import { BulkUploadService } from 'app-shared/kmc-shell/bulk-upload/bulk-upload.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class BulkUploadModule {
  static forRoot(): ModuleWithProviders<BulkUploadModule> {
    return {
      ngModule: BulkUploadModule,
      providers: [
        BulkUploadService
      ]
    };
  }
}
