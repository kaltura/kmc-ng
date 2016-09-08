import { NgModule }           from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule }       from '@angular/common';

import {AppContainerComponent} from "@kaltura/kmcng-shell";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        AppContainerComponent
    ],
    exports: [
        AppContainerComponent
        ],
    providers: []
})
export class KMCTemporaryModule { }
