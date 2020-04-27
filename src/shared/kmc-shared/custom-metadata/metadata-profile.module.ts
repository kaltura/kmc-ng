import { ModuleWithProviders, NgModule } from '@angular/core';
import { MetadataProfileStore } from './metadata-profile-store.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class MetadataProfileModule {
  static forRoot(): ModuleWithProviders<MetadataProfileModule> {
    return {
      ngModule: MetadataProfileModule,
      providers: <any[]>[
        MetadataProfileStore
      ]
    };
  }
}
