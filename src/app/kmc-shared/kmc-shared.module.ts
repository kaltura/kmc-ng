import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KalturaUIModule } from '@kaltura/kmcng-ui';

import { TreeModule, SharedModule } from 'primeng/primeng';

import { CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe } from './content-ui';
import { LoaderComponent } from './loader/loadercomponent';

@NgModule({
  imports:      [ CommonModule, TreeModule, FormsModule, SharedModule, KalturaUIModule ],
  declarations: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe, LoaderComponent ],
  providers:    [],
  exports: [ CategoriesFilterComponent, EntryTypePipe, EntryStatusPipe, PlaylistTypePipe, LoaderComponent ]
})
export class KMCSharedModule { }
