import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsLiveFrameComponent } from './analytics-live-frame.component';
import { AnalyticsLiveComponent } from './analytics-live.component';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui/kaltura-ui.module';


@NgModule({
    imports: [
        CommonModule,
        KalturaUIModule
    ],
    declarations: [
        AnalyticsLiveFrameComponent,
        AnalyticsLiveComponent
    ],
    providers: [],
    exports: [
        AnalyticsLiveFrameComponent,
        AnalyticsLiveComponent
    ]
})
export class AnalyticsLiveModule {
}
