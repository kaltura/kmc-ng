import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccessControlProfileStore } from 'app-shared/kmc-shared/access-control/access-control-profile-store.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class AccessControlProfileModule {
  static forRoot(): ModuleWithProviders<AccessControlProfileModule> {
    return {
      ngModule: AccessControlProfileModule,
      providers: <any[]>[
        AccessControlProfileStore
      ]
    };
  }
}
