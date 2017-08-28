import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeTreeModule } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { AreaBlockerModule, KalturaUIModule } from '@kaltura-ng/kaltura-ui';
import { ButtonModule, CalendarModule, CheckboxModule, RadioButtonModule, TreeModule } from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';

import { EntryStatusPipe } from 'app-shared/content-shared/pipes/entry-status.pipe';
import { CategoriesTreeComponent } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import { SchedulingComponent } from 'app-shared/content-shared/scheduling/scheduling.component';
import { CategoriesPrimeService } from 'app-shared/content-shared/categories-prime.service';
import { CategoriesStore } from 'app-shared/content-shared/categories-store.service';
import { EntryTypePipe } from 'app-shared/content-shared/pipes/entry-type.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    PrimeTreeModule,
    AreaBlockerModule,
    KalturaCommonModule,
    KalturaPrimeNgUIModule,
    KalturaUIModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    CheckboxModule
  ],
  declarations: [
    EntryStatusPipe,
    EntryTypePipe,
    CategoriesTreeComponent,
    SchedulingComponent
  ],
  exports: [
    EntryStatusPipe,
    EntryTypePipe,
    CategoriesTreeComponent,
    SchedulingComponent
  ],
  providers: [
    CategoriesPrimeService,
    CategoriesStore
  ]
})
export class ContentSharedModule {
}
