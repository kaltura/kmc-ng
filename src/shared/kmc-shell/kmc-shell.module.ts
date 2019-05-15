import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CheckboxModule, SharedModule } from 'primeng/primeng';

import { BrowserService } from './providers/browser.service';
import { ReleaseNotesComponent } from './components/release-notes/release-notes.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { EntryTypePipe } from 'app-shared/kmc-shell/pipes/entry-type.pipe';
import { PageExitVerificationService, UploadPageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification';
import { PreventPasswordAutofillDirective } from 'app-shared/kmc-shell/directives/prevent-password-autofill.directive';

@NgModule({
    imports: <any[]>[
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule
    ],
    declarations: <any[]>[
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
        PreventPasswordAutofillDirective,
    ],
    exports: <any[]>[
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
        PreventPasswordAutofillDirective,
    ],
    providers: <any[]>[]
})
export class KMCShellModule {
    constructor(@Optional() @Self()  _uploadPageExitVerificationService: UploadPageExitVerificationService,
                @Optional() @Self()  _browserService: BrowserService) {
        if (_uploadPageExitVerificationService) {
            _uploadPageExitVerificationService.init();
        }

        if (_browserService) {
            _browserService.initLocationListener();
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KMCShellModule,
            providers: <any[]>[
                BrowserService,
                PageExitVerificationService,
                UploadPageExitVerificationService
            ]
        };
    }
}
