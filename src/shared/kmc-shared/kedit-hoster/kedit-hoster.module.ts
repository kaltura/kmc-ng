import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {KalturaUIModule} from '@kaltura-ng/kaltura-ui';
import {KeditHosterComponent} from 'app-shared/kmc-shared/kedit-hoster/kedit-hoster.component';

@NgModule({
  imports: [
      CommonModule,
      KalturaUIModule
  ],
  declarations: [
      KeditHosterComponent
  ],
  exports: [KeditHosterComponent],
  providers: [
  ]
})
export class KEditHosterModule {
}
