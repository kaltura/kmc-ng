import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsMrComponent } from './settings-mr.component';
import { routing } from './settings-mr-app.routes';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule, PopupWidgetModule, InputHelperModule } from '@kaltura-ng/kaltura-ui';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { InputNumberModule } from 'primeng/inputnumber';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KalturaPrimeNgUIModule } from "@kaltura-ng/kaltura-primeng-ui";
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
import { CriteriaCreatedComponent } from './rule/criteria/created.component';
import { CriteriaPlayedComponent } from './rule/criteria/played.component';

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
        InputHelperModule,
        CheckboxModule,
        InputNumberModule,
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
        LocalizationModule
    ],
  declarations: [
      SettingsMrComponent,
      RulesComponent,
      ReviewComponent,
      LogsComponent,
      MrSectionsList,
      DeleteRuleComponent,
      NewRuleComponent,
      RuleComponent,
      CriteriaComponent,
      CriteriaCreatedComponent,
      CriteriaPlayedComponent
  ],
    providers: [MrStoreService]
})
export class SettingsMrAppModule {
}
