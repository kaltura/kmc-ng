import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { CategoriesStatusMonitorService } from './categories-status-monitor.service';

@NgModule({
  imports: [
  ],
  declarations: [],
  exports: [
  ]
})
export class CategoriesStatusModule {
    constructor(@Optional() @Self() private _categoriesStatusMonitorService: CategoriesStatusMonitorService){
        // NOTICE: it is important to get '_categoriesStatusMonitorService'
        // even when it is not in use internally.
        // getting it from the DI will force initiation of that service
    }
    static forRoot(): ModuleWithProviders<CategoriesStatusModule> {
        return {
            ngModule: CategoriesStatusModule,
            providers: [CategoriesStatusMonitorService]
        };
    }
}
