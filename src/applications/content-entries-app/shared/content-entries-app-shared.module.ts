import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntryStatusPipe } from './pipes/entry-status.pipe';
import { EntryTypePipe } from './pipes/entry-type.pipe';
import { CategoriesPrime } from './categories-prime.service';
import { CategoriesTreeComponent } from './categories-tree/categories-tree.component';
import { TreeSelectionModule } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';
import { TreeModule } from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng2/kaltura-common';


@NgModule({
    imports: [
	    TreeModule,
	    TreeSelectionModule,
	    CommonModule,
	    KalturaCommonModule
    ],
    declarations: [
        EntryStatusPipe,
        EntryTypePipe,
	    CategoriesTreeComponent
    ],
    exports: [
        EntryStatusPipe,
        EntryTypePipe,
	    CategoriesTreeComponent
    ],
    providers: [
	    CategoriesPrime
    ],
})
export class ContentEntriesAppSharedModule {
}
