import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppShellService } from './providers/app-shell.service';
import { BrowserService } from './providers/browser.service';
import { AppAnalytics } from './providers/app-analytics.service';
import { AppContainerComponent } from 'app-shared/kmc-shell/components';
import { ReleaseNotesComponent } from 'app-shared/kmc-shell/components';
import { ScrollToTopComponent } from 'app-shared/kmc-shell/components';
import { EntryTypePipe } from 'app-shared/kmc-shell/pipes/entry-type.pipe';
import { PageExitVerificationService, UploadPageExitVerificationService } from 'app-shared/kmc-shell/page-exit-verification';
import { PreventPasswordAutofillDirective } from 'app-shared/kmc-shell/directives/prevent-password-autofill.directive';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModule } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { KPFService } from "app-shared/kmc-shell/providers/kpf.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule
    ],
    declarations: [
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
        PreventPasswordAutofillDirective,
    ],
    exports: [
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe,
        PreventPasswordAutofillDirective,
    ],
    providers: [MessageService]
})
export class KMCShellModule {
    constructor(@Optional() @Self()  _uploadPageExitVerificationService: UploadPageExitVerificationService,
                @Optional() @Self()  _browserService: BrowserService,
                @Optional() @Self()  _analyticsService: AppAnalytics) {
        if (_uploadPageExitVerificationService) {
            _uploadPageExitVerificationService.init();
        }

        if (_browserService) {
            _browserService.initLocationListener();
        }

        if (_analyticsService) {
            _analyticsService.init();
        }
    }

    static forRoot(): ModuleWithProviders<KMCShellModule> {
        return {
            ngModule: KMCShellModule,
            providers: [
                BrowserService,
                AppAnalytics,
                KPFService,
                AppShellService,
                PageExitVerificationService,
                UploadPageExitVerificationService
            ]
        };
    }
}
