import { ModuleWithProviders, NgModule } from '@angular/core';
import { AppEventsService } from './app-events.service';

@NgModule({
    providers: [
    ]
})
export class AppEventsModule {
    public static forRoot(): ModuleWithProviders<AppEventsModule> {
        return {
            ngModule: AppEventsModule,
            providers: [
                AppEventsService
            ]
        };
    }
}