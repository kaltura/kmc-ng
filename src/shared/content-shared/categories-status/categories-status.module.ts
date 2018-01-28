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

    }
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CategoriesStatusModule,
            providers: [CategoriesStatusMonitorService]
        };
    }
}
