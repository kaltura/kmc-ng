import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {routing} from './analytics-kava-app.routes';
import {AnalyticsKavaComponent} from './analytics-kava.component';
import {KalturaUIModule} from '@kaltura-ng/kaltura-ui';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        KalturaUIModule
    ],
    declarations: [
        AnalyticsKavaComponent
    ],
    exports: [],
    providers: [
    ],
})
export class AnalyticsKavaAppModule {
}
