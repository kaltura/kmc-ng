import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { ViewCategoryEntriesService } from './view-category-entries.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class ViewCategoryEntriesModule {
  static forRoot(): ModuleWithProviders<ViewCategoryEntriesModule> {
    return {
      ngModule: ViewCategoryEntriesModule,
      providers: [ViewCategoryEntriesService]
    };
  }

  constructor(@Optional() @Self() playlistCreationService: ViewCategoryEntriesService) {
    if (playlistCreationService) {
      playlistCreationService.init();
    }
  }
}
