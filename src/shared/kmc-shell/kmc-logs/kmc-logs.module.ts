import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PowerUserConsoleModule } from '@kaltura-ng/mc-shared';
import { LogsRecordComponent } from 'app-shared/kmc-shell/kmc-logs/logs-record/logs-record.component';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import { PowerUserConsoleComponent } from 'app-shared/kmc-shell/kmc-logs/power-user-console/power-user-console.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule,
        TranslateModule,
        PowerUserConsoleModule,
        PopupWidgetModule,
        DropdownModule,
        ButtonModule
    ],
    declarations: [
        PowerUserConsoleComponent,
        LogsRecordComponent
    ],
    exports: [
        PowerUserConsoleComponent,
        LogsRecordComponent
    ],
    providers: []
})
export class KmcLogsModule {
    static forRoot(): ModuleWithProviders<KmcLogsModule> {
        return {
            ngModule: KmcLogsModule,
            providers: [
                KmcLoggerConfigurator
            ]
        };
    }
}
