import { Inject, Injectable, InjectionToken, Renderer2, RendererFactory2 } from '@angular/core';
import { ColumnsResizeStorageManagerService, ResizableColumns } from './columns-resize-storage-manager.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

export const ResizableColumnsTableName = new InjectionToken('resizable-columns-table-name');

@Injectable()
export class ColumnsResizeManagerService {
    private _renderer: Renderer2;

    constructor(private _storageManager: ColumnsResizeStorageManagerService,
                private _logger: KalturaLogger,
                @Inject(ResizableColumnsTableName) private _tableName: string,
                rendererFactory: RendererFactory2) {
        this._logger = _logger.subLogger(`ColumnsResizeManagerService:${_tableName}`);
        this._renderer = rendererFactory.createRenderer(null, null);
    }

    private _updateNextSiblings(element: HTMLTableHeaderCellElement, config: ResizableColumns): void {
        const nextSibling = <HTMLTableHeaderCellElement>element.nextElementSibling;
        if (nextSibling && nextSibling.dataset && nextSibling.dataset.cid) {
            const { dataset: { cid: columnName }, offsetWidth: columnWidth } = nextSibling;
            config[columnName] = `${columnWidth}px`;
            this._updateNextSiblings(nextSibling, config);
        }
    }

    private _updatePrevSiblings(element: HTMLTableHeaderCellElement, config: ResizableColumns): void {
        const prevSibling = <HTMLTableHeaderCellElement>element.previousElementSibling;
        if (prevSibling && prevSibling.dataset && prevSibling.dataset.cid) {
            const { dataset: { cid: columnName }, offsetWidth: columnWidth } = prevSibling;
            config[columnName] = `${columnWidth}px`;
            this._updatePrevSiblings(prevSibling, config);
        }
    }

    private _setStyle(el: HTMLElement, column: string, width: string): void {
        const relevantElements = el.querySelectorAll(`[data-cid="${column}"]`);
        [].slice.call(relevantElements)
            .forEach(element => {
                if (element instanceof HTMLElement) {
                    this._renderer.setStyle(element, 'width', width);
                }
            });
    }

    public onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }): void {
        this._logger.info(`handle column resize action by user`, {
            tableName: this._tableName,
            columnName: event && event.element ? event.element.id : null
        });
        const relevantConfig = this._storageManager.getConfig(this._tableName);
        if (!relevantConfig) {
            this._logger.info(`no relevant config found, abort action`);
            return;
        }

        const { dataset: { cid: columnName }, offsetWidth: columnWidth } = event.element;
        if (columnName) {
            relevantConfig[columnName] = `${columnWidth}px`;

            this._updateNextSiblings(event.element, relevantConfig);
            this._updatePrevSiblings(event.element, relevantConfig);

            this._storageManager.setConfigInCache(relevantConfig, this._tableName);
        }
    }

    public updateColumns(el: HTMLElement = document.documentElement): void {
        this._logger.info(`handle update columns action by user, init columns width`, { tableName: this._tableName });
        window.requestAnimationFrame(() => {
            const config = this._storageManager.loadConfig(this._tableName);
            Object.keys(config)
                .forEach(column => this._setStyle(el, column, String(config[column])));
        });
    }
}
