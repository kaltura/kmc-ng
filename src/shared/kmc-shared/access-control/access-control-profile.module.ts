import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccessControlProfileStore } from 'app-shared/kmc-shared/access-control/access-control-profile-store.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class AccessControlProfileModule {
  static forRoot(): ModuleWithProviders<AccessControlProfileModule> {
    return {
      ngModule: AccessControlProfileModule,
      providers: [
        AccessControlProfileStore
      ]
    };
  }
}
