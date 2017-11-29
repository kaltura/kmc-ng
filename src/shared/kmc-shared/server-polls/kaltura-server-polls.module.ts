import { ModuleWithProviders, NgModule } from '@angular/core';
import { KalturaServerPolls } from './kaltura-server-polls.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class KalturaServerPollsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: KalturaServerPollsModule,
      providers: [KalturaServerPolls]
    };
  }
}
