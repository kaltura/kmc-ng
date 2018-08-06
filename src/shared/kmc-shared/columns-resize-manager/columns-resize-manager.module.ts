import { ModuleWithProviders, NgModule } from '@angular/core';
import { ColumnsResizeStorageManagerService } from './columns-resize-storage-manager.service';

@NgModule({
    imports: [],
    declarations: [],
    exports: [],
    providers: []
})
export class ColumnsResizeManagerModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ColumnsResizeManagerModule,
            providers: [ColumnsResizeStorageManagerService]
        };
    }
}
