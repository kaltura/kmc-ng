import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReachAppComponent } from './reach-app.component';
import { KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { LocalizationModule } from '@kaltura-ng/mc-shared';
import { ReachModule } from 'app-shared/kmc-shared';
import { RouterModule } from '@angular/router';
import { routing } from './reach-app.routes';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        KalturaUIModule,
        ReachModule,
        LocalizationModule
    ],
    declarations: [
        ReachAppComponent
    ],
    exports: [],
    providers: [],
})
export class ReachAppModule {
}
