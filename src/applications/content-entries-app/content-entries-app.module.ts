import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routing } from './content-entries-app.routes';
import { EntriesModule } from "./entries/entries.module";
import { EntryModule } from './entry/entry.module';
import { ContentEntriesComponent } from './content-entries.component';


@NgModule({
    imports: [
        EntriesModule,
        EntryModule,
        CommonModule,
        RouterModule.forChild(routing)
    ],
    declarations: [
        ContentEntriesComponent
    ],
    exports: [],
    providers: [],
})
export class ContentEntriesAppModule {
}