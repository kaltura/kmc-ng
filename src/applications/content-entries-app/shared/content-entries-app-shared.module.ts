import { NgModule } from '@angular/core';
import { EntryStatusPipe } from './pipes/entry-status.pipe';
import { EntryTypePipe } from './pipes/entry-type.pipe';


@NgModule({
    imports: [
    ],
    declarations: [
        EntryStatusPipe,
        EntryTypePipe
    ],
    exports: [
        EntryStatusPipe,
        EntryTypePipe
    ],
    providers: [

    ],
})
export class ContentEntriesAppSharedModule {
}