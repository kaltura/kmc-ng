import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ColumnsResizeStorageManagerService, ResizableColumns } from './columns-resize-storage-manager.service';

export const ResizableColumnsTableName = new InjectionToken('resizable-columns-table-name');

@Injectable()
export class ColumnsResizeManagerService {
    constructor(@Inject(ResizableColumnsTableName) private _tableName: string,
                private _storageManager: ColumnsResizeStorageManagerService) {
        this._storageManager.registerTable(this._tableName);
    }

    public onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }): void {
        this._storageManager.onColumnResize(event);
    }

    public onWindowResize(): boolean {
        return this._storageManager.onWindowResize();
    }

    public getConfig(): ResizableColumns {
        return this._storageManager.getConfig();
    }
}
