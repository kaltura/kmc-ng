import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura/kmcng-ui';

import { TreeModule, SharedModule } from 'primeng/primeng';

import { CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe } from './content-ui';

@NgModule({
  imports:      [ CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule ],
  declarations: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ],
  providers:    [],
  exports: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe ]
})
export class KMCSharedModule { }
