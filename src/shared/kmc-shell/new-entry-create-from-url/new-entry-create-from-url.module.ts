import { ModuleWithProviders, NgModule } from '@angular/core';
import { NewEntryCreateFromUrlService } from './new-entry-create-from-url.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class NewEntryCreateFromUrlModule {

  static forRoot(): ModuleWithProviders<NewEntryCreateFromUrlModule> {
    return {
      ngModule: NewEntryCreateFromUrlModule,
      providers: <any[]>[
        NewEntryCreateFromUrlService
      ]
    };
  }
}
