import { ModuleWithProviders, NgModule } from '@angular/core';
import { PlaylistCreationService } from 'app-shared/kmc-shared/playlist-creation/playlist-creation.service';

@NgModule({
  imports: <any[]>[],
  declarations: <any[]>[],
  exports: <any[]>[],
  providers: <any[]>[]
})
export class PlaylistCreationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlaylistCreationModule,
      providers: [PlaylistCreationService]
    };
  }
}
