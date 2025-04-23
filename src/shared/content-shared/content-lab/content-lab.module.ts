import { ModuleWithProviders, NgModule } from '@angular/core';
import {ContentLabBtnComponent} from './content-lab-button/content-lab-button.component';
import {PopupWidgetModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {LocalizationModule} from '@kaltura-ng/mc-shared';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
      TooltipModule,
      LocalizationModule,
      ButtonModule,
      CommonModule,
      PopupWidgetModule
  ],
  declarations: [
      ContentLabBtnComponent
  ],
  exports: [
      ContentLabBtnComponent
  ]
})
export class ContentLabModule {
    static forRoot(): ModuleWithProviders<ContentLabModule> {
        return {
            ngModule: ContentLabModule
        };
    }
}
