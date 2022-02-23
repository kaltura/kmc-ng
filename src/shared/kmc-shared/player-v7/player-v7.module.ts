import { ModuleWithProviders, NgModule } from '@angular/core';
import { KalturaPlayerV7Component } from "./player-v7.component";

@NgModule({
    imports: [
    ],
    declarations: [
        KalturaPlayerV7Component
        ],
    exports: [
        KalturaPlayerV7Component,
        ]
})
export class PlayerV7Module {
    static forRoot(): ModuleWithProviders<PlayerV7Module> {
        return {
            ngModule: PlayerV7Module
        };
    }
}
