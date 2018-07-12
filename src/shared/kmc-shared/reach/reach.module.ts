import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReachFrameComponent } from './reach-frame.component';
import { ReachComponent } from './reach.component';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';

@NgModule({
    imports: [
        CommonModule,
        KalturaUIModule
    ],
    declarations: [
        ReachFrameComponent,
        ReachComponent
    ],
    providers: [],
    exports: [
        ReachFrameComponent,
        ReachComponent
    ]
})
export class ReachModule {
}
