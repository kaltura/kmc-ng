import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {routing} from './analytics-live-app.routes';
import {AnalyticsLiveComponent} from './analytics-live.component';
import {KalturaUIModule} from '@kaltura-ng/kaltura-ui';
import { LocalizationModule } from '@kaltura-ng/mc-shared/localization/localization.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        KalturaUIModule,
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
