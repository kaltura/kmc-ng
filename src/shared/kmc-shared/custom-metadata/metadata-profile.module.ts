import { ModuleWithProviders, NgModule } from '@angular/core';
import { MetadataProfileStore } from './metadata-profile-store.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class MetadataProfileModule {
  static forRoot(): ModuleWithProviders<MetadataProfileModule> {
    return {
      ngModule: MetadataProfileModule,
      providers: [
        MetadataProfileStore
      ]
    };
  }
}
