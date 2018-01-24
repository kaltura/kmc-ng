import { ModuleWithProviders, NgModule } from '@angular/core';
import { CategoriesStatusMonitorService } from './categories-status-monitor.service';

@NgModule({
  imports: [
  ],
  declarations: [],
  exports: [
  ]
})
export class CategoriesStatusModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CategoriesStatusModule,
            providers: [CategoriesStatusMonitorService]
        };
    }
}
