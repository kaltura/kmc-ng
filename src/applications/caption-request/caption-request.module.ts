import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaBlockerModule, PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { LocalizationModule } from '@kaltura-ng/mc-shared';
import { ReachFrameModule } from 'app-shared/kmc-shared/reach-frame';
import { ReachComponent } from './reach.component';
import { CaptionRequestComponent } from './caption-request.component';


@NgModule({
    imports: [
        CommonModule,
        PopupWidgetModule,
        AreaBlockerModule,
        LocalizationModule,
        ReachFrameModule
    ],
    declarations: [
        CaptionRequestComponent,
        ReachComponent
    ],
    providers: [],
    exports: [
        CaptionRequestComponent
    ]
})
export class CaptionRequestModule {
}
