import { Component } from '@angular/core';
import { SettingsReachService } from './settings-reach.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { ReachProfilesStore } from './reach-profiles/reach-profiles-store/reach-profiles-store.service';
import { ReachServicesStore } from './reach-profiles/reach-services-store/reach-services-store.service';
import { ReachServicesRefineFiltersService } from "./reach-profiles/reach-services-store/reach-services-refine-filters.service";


@Component({
  selector: 'kmc-settings-reach',
  template: '<router-outlet></router-outlet>',
  providers: [
    SettingsReachService,
    ReachProfilesStore,
    ReachServicesStore,
    ReachServicesRefineFiltersService,
    KalturaLogger.createLogger('SettingsReach')
  ],
})
export class SettingsReachComponent {
}
