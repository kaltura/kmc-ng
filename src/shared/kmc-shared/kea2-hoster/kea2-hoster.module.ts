import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { PlaylistCreationService } from 'app-shared/kmc-shared/playlist-creation/playlist-creation.service';
import { CommonModule } from '@angular/common';
import { Kea2HosterComponent } from 'app-shared/kmc-shared/kea2-hoster/kea2-hoster.component';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';

@NgModule({
  imports: <any[]>[
      CommonModule,
      KalturaUIModule
  ],
  declarations: <any[]>[
      Kea2HosterComponent
  ],
  exports: <any[]>[Kea2HosterComponent],
  providers: <any[]>[]
})
export class Kea2HosterModule {
}
