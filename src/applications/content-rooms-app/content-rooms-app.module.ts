import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui';

import { routing } from './content-rooms-app.routes';

import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { TableModule } from 'primeng/table';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { KalturaPrimeNgUIModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';

import { ContentRoomsComponent } from './content-rooms.component';
import { RoomCanDeactivate } from './room/room-can-deactivate.service';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';
import { FiltersModule } from '@kaltura-ng/mc-shared';
import { SliderModule } from '@kaltura-ng/kaltura-primeng-ui';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { KPTableModule } from '@kaltura-ng/kaltura-primeng-ui';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { RoomsListComponent } from "./rooms/rooms-list/rooms-list.component";
import { RoomsTagsComponent } from "./rooms/rooms-tags/rooms-tags.component";
import { CategoriesModule } from "app-shared/content-shared/categories/categories.module";
import { RoomsTableComponent } from "./rooms/rooms-table/rooms-table.component";
import { RoomSectionsList } from "./room/room-sections-list/room-sections-list.component";
import {RoomDetailsComponent} from "./room/room-details/room-details.component";
import {RoomComponent} from "./room/room.component";
import {RoomMetadataComponent} from "./room/room-metadata/room-metadata.component";
import {CategoriesSelector} from "./room/room-metadata/category-selector/categories-selector.component";
import {RoomThumbnails} from "./room/room-thumbnails/room-thumbnails.component";
import {RoomAccessControl} from "./room/room-access-control/room-access-control.component";

@NgModule({
    imports: [
      CommonModule,
      AreaBlockerModule,
      LocalizationModule,
      KalturaUIModule,
      PaginatorModule,
      TooltipModule,
      ButtonModule,
      TieredMenuModule,
      CheckboxModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextModule,
      InputTextareaModule,
      PopupWidgetModule,
      CalendarModule,
      MenuModule,
      RadioButtonModule,
      TagsModule,
      KalturaPrimeNgUIModule,
      AutoCompleteModule,
      SharedModule,
	  DetailsBarModule,
      RouterModule.forChild(routing),
	  StickyModule,
        EntriesModule,
    FiltersModule,
    DropdownModule,
    SliderModule,
      TableModule,
      KMCPermissionsModule,
        KPTableModule,
        DateFormatModule,
        CategoriesModule
  ],declarations: [
      ContentRoomsComponent,
        RoomsListComponent,
        RoomsTagsComponent,
        RoomsTableComponent,
        RoomComponent,
        RoomSectionsList,
        RoomDetailsComponent,
        RoomMetadataComponent,
        CategoriesSelector,
        RoomThumbnails,
        RoomAccessControl
    ],
    exports: [
    ],
    providers : [
      RoomCanDeactivate
    ]
})
export class ContentRoomsAppModule {
}
