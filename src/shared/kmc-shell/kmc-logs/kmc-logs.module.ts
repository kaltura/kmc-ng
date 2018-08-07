import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule, DropdownModule, SharedModule } from 'primeng/primeng';
import { TranslateModule } from '@ngx-translate/core';
import { PowerUserConsoleModule } from '@kaltura-ng/mc-shared';
import { LogsRecordComponent } from 'app-shared/kmc-shell/kmc-logs/logs-record/logs-record.component';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import { PowerUserConsoleComponent } from 'app-shared/kmc-shell/kmc-logs/power-user-console/power-user-console.component';
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: <any[]>[
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
    declarations: <any[]>[
        PowerUserConsoleComponent,
        LogsRecordComponent
    ],
    exports: <any[]>[
        PowerUserConsoleComponent,
        LogsRecordComponent
    ],
    providers: <any[]>[]
})
export class KmcLogsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KmcLogsModule,
            providers: <any[]>[
                KmcLoggerConfigurator
            ]
        };
    }
}
