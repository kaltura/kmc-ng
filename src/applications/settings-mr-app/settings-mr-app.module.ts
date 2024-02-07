import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsMrComponent} from './settings-mr.component';
import {routing} from './settings-mr-app.routes';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule, PopupWidgetModule, InputHelperModule} from '@kaltura-ng/kaltura-ui';
import {TranslateModule} from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KalturaPrimeNgUIModule } from "@kaltura-ng/kaltura-primeng-ui";
import { DateFormatModule } from "app-shared/kmc-shared/date-format/date-format.module";
import { CopyToClipboardModule } from '@kaltura-ng/mc-shared';
import { RulesComponent } from './rules/rules.component';

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
        ButtonModule,
        TableModule,
        MenuModule,
        PaginatorModule,
        AreaBlockerModule,
        TranslateModule,
        InputTextareaModule,
        KalturaUIModule,
        DateFormatModule,
        KalturaPrimeNgUIModule
    ],
  declarations: [
      SettingsMrComponent,
      RulesComponent
  ]
})
export class SettingsMrAppModule {
}
