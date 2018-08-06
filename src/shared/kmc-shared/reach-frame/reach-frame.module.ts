import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReachFrameComponent } from './reach-frame.component';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { LocalizationModule } from '@kaltura-ng/mc-shared';

@NgModule({
    imports: [
        CommonModule,
        KalturaUIModule,
        LocalizationModule
    ],
    declarations: [
        ReachFrameComponent,
    ],
    exports: [
        ReachFrameComponent,
    ]
})
export class ReachFrameModule {
}
