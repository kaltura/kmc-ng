import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {routing} from './analytics-live-app.routes';
import {AnalyticsLiveComponent} from './analytics-live.component';
import {KalturaUIModule} from '@kaltura-ng/kaltura-ui';
import { AnalyticsLiveModule } from 'app-shared/kmc-shared/analytics-live/analytics-live.module';
import { LocalizationModule } from '@kaltura-ng/mc-shared/localization/localization.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        KalturaUIModule,
        AnalyticsLiveModule,
        LocalizationModule
    ],
    declarations: [
        AnalyticsLiveComponent
    ],
    exports: [],
    providers: [
    ],
})
export class AnalyticsLiveAppModule {
}
