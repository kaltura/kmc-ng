import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsMrComponent } from './settings-mr.component';
import { routing } from './settings-mr-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule, PopupWidgetModule, InputHelperModule, TagsModule } from '@kaltura-ng/kaltura-ui';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule as PrimeMultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { InputNumberModule } from 'primeng/inputnumber';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {AutoCompleteModule, KalturaPrimeNgUIModule, MultiSelectModule, SliderModule} from '@kaltura-ng/kaltura-primeng-ui';
import { CategoriesModule } from "app-shared/content-shared/categories/categories.module";
import { DateFormatModule } from "app-shared/kmc-shared/date-format/date-format.module";
import { CopyToClipboardModule, LocalizationModule } from '@kaltura-ng/mc-shared';
import { RulesComponent } from './rules/rules.component';
import { MrSectionsList } from './mr-sections-list/mr-sections-list.component';
import { ReviewComponent } from './review/review.component';
import { LogsComponent } from './logs/logs.component';
import { MrStoreService } from './mr-store/mr-store.service';
import { DeleteRuleComponent } from './rules/delete-rule/delete-rule.component';
import { NewRuleComponent } from './rules/new-rule/new-rule.component';
import { RuleComponent } from './rule/rule.component';
import { CriteriaComponent } from './rule/criteria/criteria.component';
import {
    CriteriaCreatedComponent,
    CriteriaPlayedComponent,
    CriteriaDurationComponent,
    CriteriaPlaysComponent,
    CriteriaCategoriesComponent,
    CriteriaTagsComponent,
    CriteriaOwnerComponent,
    CriteriaMetadataComponent,
    CriteriaAdminTagsComponent,
    CriteriaCaptionsComponent
} from './rule/criteria/renderers';
import { CategoriesSelector } from './rule/category-selector/categories-selector.component';
import {KMCPermissionsModule} from 'app-shared/kmc-shared/kmc-permissions';
import {ReviewTagsComponent} from './review/review-tags/review-tags.component';
import {ReviewRefineFiltersComponent} from './review/review-refine-filters/review-refine-filters.component';
import {RuleActionsComponent} from './rule/actions/actions.component';
import {OwnerSelector} from './rule/owner-selector/owner-selector.component';
import {
    ActionFlavourComponent,
    ActionCategoryComponent,
    ActionOwnerComponent,
    ActionDeleteComponent,
    ActionTagsComponent,
    ActionNotificationComponent
} from './rule/actions/renderers';
import {EntriesModule} from 'app-shared/content-shared/entries/entries.module';
import {LogsRefineFiltersComponent} from './logs/logs-refine-filters/logs-refine-filters.component';
import {LogsTagsComponent} from './logs/logs-tags/logs-tags.component';
import {NotifyOwnerComponent} from './review/notify-owner/notify-owner.component';
import {StatusPipe} from './review/review-tags/status.pipe';
import {RadioButtonModule} from 'primeng/radiobutton';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        CopyToClipboardModule,
        InputTextModule,
        StickyModule,
        TooltipModule,
        InputSwitchModule,
        PopupWidgetModule,
        TagsModule,
        InputHelperModule,
        CategoriesModule,
        CheckboxModule,
        CalendarModule,
        InputNumberModule,
        PrimeMultiSelectModule,
        ButtonModule,
        TieredMenuModule,
        TableModule,
        MenuModule,
        PaginatorModule,
        AreaBlockerModule,
        TranslateModule,
        InputTextareaModule,
        KalturaUIModule,
        DateFormatModule,
        KalturaPrimeNgUIModule,
        LocalizationModule,
        AutoCompleteModule,
        KMCPermissionsModule,
        MultiSelectModule,
        EntriesModule,
        RadioButtonModule,
        SliderModule
    ],
  declarations: [
      SettingsMrComponent,
      RulesComponent,
      ReviewComponent,
      ReviewTagsComponent,
      ReviewRefineFiltersComponent,
      LogsComponent,
      MrSectionsList,
      DeleteRuleComponent,
      NewRuleComponent,
      RuleComponent,
      RuleActionsComponent,
      OwnerSelector,
      CriteriaComponent,
      CriteriaCreatedComponent,
      CriteriaPlayedComponent,
      CriteriaDurationComponent,
      CriteriaPlaysComponent,
      CriteriaCategoriesComponent,
      CategoriesSelector,
      CriteriaTagsComponent,
      CriteriaAdminTagsComponent,
      CriteriaCaptionsComponent,
      CriteriaMetadataComponent,
      CriteriaOwnerComponent,
      ActionFlavourComponent,
      ActionCategoryComponent,
      ActionOwnerComponent,
      ActionDeleteComponent,
      ActionTagsComponent,
      ActionNotificationComponent,
      LogsRefineFiltersComponent,
      LogsTagsComponent,
      NotifyOwnerComponent,
      StatusPipe
  ],
    providers: [MrStoreService]
})
export class SettingsMrAppModule {
}
