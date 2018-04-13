import { NgModule, SkipSelf, Optional, ModuleWithProviders, Self } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CheckboxModule, SharedModule, SidebarModule } from 'primeng/primeng';

import { AppShellService } from "./providers/app-shell.service";
import { BrowserService } from "./providers/browser.service";
import { AppContainerComponent } from './components/app-container/app-container.component';
import { ReleaseNotesComponent } from './components/release-notes/release-notes.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { EntryTypePipe } from 'app-shared/kmc-shell/pipes/entry-type.pipe';
import { PageExitVerificationService, UploadPageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification';
import { PowerUserConsoleComponent } from 'app-shared/kmc-shell/components';
import { TranslateModule } from 'ng2-translate/ng2-translate';

@NgModule({
    imports: <any[]>[
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule,
        TranslateModule,
        SidebarModule
    ],
    declarations: <any[]>[
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
        PowerUserConsoleComponent
    ],
    exports: <any[]>[
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
        PowerUserConsoleComponent
    ],
    providers: <any[]>[

    ]
})
export class KMCShellModule {
    constructor(@Optional() @Self()  _uploadPageExitVerificationService: UploadPageExitVerificationService)
    {
        if (_uploadPageExitVerificationService) {
            _uploadPageExitVerificationService.init();
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KMCShellModule,
            providers: <any[]>[
                BrowserService,
                AppShellService,
                PageExitVerificationService,
                UploadPageExitVerificationService
            ]
        };
    }
}
