import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KMCPermissionsService } from './kmc-permissions.service';
import { HiddenIfNotPermittedPipe } from 'app-shared/kmc-shared/kmc-permissions/hidden-if-not-permitted.pipe';
import { DisabledIfNotPermittedPipe } from 'app-shared/kmc-shared/kmc-permissions/disabled-if-not-permitted.pipe';
import { NgIfPermittedPipe } from 'app-shared/kmc-shared/kmc-permissions/ng-if-permitted.pipe';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        HiddenIfNotPermittedPipe,
        DisabledIfNotPermittedPipe,
        NgIfPermittedPipe
        ],
    exports: [
        HiddenIfNotPermittedPipe,
        DisabledIfNotPermittedPipe,
        NgIfPermittedPipe,
        ]
})
export class KMCPermissionsModule {
    static forRoot(): ModuleWithProviders<KMCPermissionsModule> {
        return {
            ngModule: KMCPermissionsModule,
            providers: [
                KMCPermissionsService
            ]
        };
    }
}
