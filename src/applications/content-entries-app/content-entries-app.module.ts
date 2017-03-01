import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing } from './content-entries-app.routes';
import { EntriesModule } from "./entries/entires.module";
import { EntryModule } from './entry/entry.module';


@NgModule({
    imports: [
        EntriesModule,
        EntryModule,
        CommonModule,
        RouterModule.forChild(routing)
    ],
    declarations: [],
    exports: [],
    providers: [],
})
export class ContentEntriesAppModule {
}