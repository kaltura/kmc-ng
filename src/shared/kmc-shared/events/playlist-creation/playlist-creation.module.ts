import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { PlaylistCreationService } from 'shared/kmc-shared/events/playlist-creation/playlist-creation.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class PlaylistCreationModule {
  static forRoot(): ModuleWithProviders<PlaylistCreationModule> {
    return {
      ngModule: PlaylistCreationModule,
      providers: [PlaylistCreationService]
    };
  }

  constructor(@Optional() @Self() playlistCreationService: PlaylistCreationService) {
    if (playlistCreationService) {
      playlistCreationService.init();
    }
  }
}
