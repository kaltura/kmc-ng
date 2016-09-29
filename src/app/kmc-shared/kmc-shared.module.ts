import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura/kmcng-ui';

import { TreeModule, SharedModule } from 'primeng/primeng';

import { CategoriesFilterComponent } from './content-ui/categories-filter/categories-filter.component';

@NgModule({
  imports:      [ CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule ],
  declarations: [ CategoriesFilterComponent ],
  providers:    [],
  exports: [ CategoriesFilterComponent ]
})
export class KMCSharedModule { }
