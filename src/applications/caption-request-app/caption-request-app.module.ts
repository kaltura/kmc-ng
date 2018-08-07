import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaBlockerModule, PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { LocalizationModule } from '@kaltura-ng/mc-shared';
import { ReachFrameModule } from 'app-shared/kmc-shared/reach-frame';
import { ReachComponent } from './reach.component';
import { CaptionRequestAppComponent } from './caption-request-app.component';


@NgModule({
    imports: [
        CommonModule,
        PopupWidgetModule,
        AreaBlockerModule,
        LocalizationModule,
        ReachFrameModule
    ],
    declarations: [
        CaptionRequestAppComponent,
        ReachComponent
    ],
    providers: [],
    exports: [
        CaptionRequestAppComponent
    ]
})
export class CaptionRequestAppModule {
}
