import { ModuleWithProviders, NgModule } from '@angular/core';
import { NewEntryCreateFromUrlService } from './new-entry-create-from-url.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class NewEntryCreateFromUrlModule {

  static forRoot(): ModuleWithProviders<NewEntryCreateFromUrlModule> {
    return {
      ngModule: NewEntryCreateFromUrlModule,
      providers: [
        NewEntryCreateFromUrlService
      ]
    };
  }
}
