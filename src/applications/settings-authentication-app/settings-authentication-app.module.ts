import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsAuthenticationComponent} from './settings-authentication.component';
import {routing} from './settings-authentication-app.routes';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AreaBlockerModule, KalturaUIModule, StickyModule, TooltipModule, PopupWidgetModule} from '@kaltura-ng/kaltura-ui';
import {TranslateModule} from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProfilesListComponent } from "./profiles-list/profiles-list.component";
import { KalturaPrimeNgUIModule } from "@kaltura-ng/kaltura-primeng-ui";
import { DateFormatModule } from "app-shared/kmc-shared/date-format/date-format.module";
import { DeleteProfileComponent } from "./delete-profile/delete-profile.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        InputTextModule,
        StickyModule,
        TooltipModule,
        PopupWidgetModule,
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
      SettingsAuthenticationComponent,
      ProfilesListComponent,
      DeleteProfileComponent,
      EditProfileComponent
  ]
})
export class SettingsAuthenticationAppModule {
}
