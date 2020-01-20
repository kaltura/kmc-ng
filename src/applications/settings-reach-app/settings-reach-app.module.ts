import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsReachComponent } from './settings-reach.component';
import { routing } from './settings-reach-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AreaBlockerModule } from '@kaltura-ng/kaltura-ui';
import { TagsModule } from '@kaltura-ng/kaltura-ui';
import { TranslateModule } from '@ngx-translate/core';
import { ReachProfilesComponentsList } from './reach-profiles/components-list';
import { KalturaUIModule, TooltipModule, StickyModule } from '@kaltura-ng/kaltura-ui';
import { MenuModule } from 'primeng/menu';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import { DetailsBarModule } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { KMCPermissionsModule } from 'app-shared/kmc-shared/kmc-permissions';
import { TableModule } from 'primeng/table';
import { DateFormatModule } from 'app-shared/kmc-shared/date-format/date-format.module';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ReachProfileComponentsList } from "./reach-profile/components-list";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routing),
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    AreaBlockerModule,
    TagsModule,
    TranslateModule,
    TooltipModule,
    LocalizationModule,
    KalturaUIModule,
    PaginatorModule,
    StickyModule,
    MenuModule,
    DetailsBarModule,
    TooltipModule,
    PopupWidgetModule,
    DropdownModule,
    KMCPermissionsModule,
      TableModule,
      DateFormatModule,
  ],
  declarations: [
    SettingsReachComponent,
    ...ReachProfilesComponentsList,
    ...ReachProfileComponentsList
  ],
  providers: [
  ]
})
export class SettingsReachAppModule {
}
