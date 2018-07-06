import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ColumnsResizeStorageManagerService, ResizableColumns } from './columns-resize-storage-manager.service';

export const ResizableColumnsTableName = new InjectionToken('resizable-columns-table-name');

@Injectable()
export class ColumnsResizeManagerService {
    constructor(private _storageManager: ColumnsResizeStorageManagerService,
                @Inject(ResizableColumnsTableName) @Optional() private _tableName: string) {
        this._storageManager.registerTable(this._tableName);
    }

    public onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }, tableName?: string): void {
        this._storageManager.onColumnResize(event, tableName);
    }

    public onWindowResize(tableName?: string): boolean {
        return this._storageManager.onWindowResize(tableName);
    }

    public getConfig(tableName?: string): ResizableColumns {
        return this._storageManager.getConfig(tableName);
    }
}
