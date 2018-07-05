import { Inject, Injectable, InjectionToken } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell';

export interface ResizableColumns {
    [columnName: string]: string | number;
    lastViewPortWidth?: number;
}

export interface ResizableColumnsConfig {
    [tableName: string]: ResizableColumns;
}

@Injectable({ providedIn: 'root' })
export class ColumnsResizeStorageManagerService {
    private readonly _windowWidthThreshold = 20;
    private _columnsConfig: ResizableColumnsConfig = {};
    private _tableName: string = null;

    private get _currentWindowWidth(): number {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    constructor(private _logger: KalturaLogger,
                private _browserService: BrowserService) {
        this._logger = _logger.subLogger('ColumnsResizeStorageManagerService');
    }

    private _getCacheToken(): string {
        return this._tableName ? `resizable-columns.${this._tableName}` : null;
    }

    private _getConfigFromCache(): ResizableColumns {
        const cacheToken = this._getCacheToken();
        this._logger.info(`load columns config from the local storage`, { cacheToken, tableName: this._tableName });
        if (cacheToken) {
            const config = this._browserService.getFromLocalStorage(cacheToken);
            try {
                this._columnsConfig[this._tableName] = JSON.parse(config) || { lastViewPortWidth: this._currentWindowWidth };
                return this._columnsConfig[this._tableName];
            } catch (e) {
                this._logger.warn(`couldn't load config from the local storage, return empty array`, { errorMessage: e.message });
                return { lastViewPortWidth: this._currentWindowWidth };
            }
        }

        return { lastViewPortWidth: this._currentWindowWidth };
    }

    private _setConfigInCache(config: ResizableColumns): void {
        this._logger.info(`set config in the local storage`, { tableName: this._tableName });
        const cacheToken = this._getCacheToken();
        if (cacheToken) {
            try {
                this._browserService.setInLocalStorage(cacheToken, JSON.stringify(config));
                this._columnsConfig[this._tableName] = Object.assign(this._columnsConfig[this._tableName], config);
            } catch (e) {
                this._logger.warn(`couldn't set updated config to the local storage, do nothing`, { errorMessage: e.message });
            }
        }
    }

    private _removeConfigFromCache(): void {
        const cacheToken = this._getCacheToken();
        this._logger.info(`handle remove config from cache action`, { cacheToken, tableName: this._tableName });
        if (cacheToken) {
            try {
                this._browserService.removeFromLocalStorage(cacheToken);
            } catch (e) {
                this._logger.warn(`couldn't load config from the local storage, return empty array`, { errorMessage: e.message });
            }
        }
    }

    private _getConfig(): ResizableColumns {
        if (!this._tableName) {
            return null;
        }

        if (this._columnsConfig.hasOwnProperty(this._tableName)) {
            return this._columnsConfig[this._tableName];
        }

        this._columnsConfig[this._tableName] = { lastViewPortWidth: this._currentWindowWidth };

        return this._columnsConfig[this._tableName];
    }

    public onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }): void {
        this._logger.info(`handle column resize action by user`, {
            tableName: this._tableName,
            columnName: event && event.element ? event.element.id : null
        });
        const relevantConfig = this._getConfig();
        if (!relevantConfig) {
            this._logger.info(`no relevant config found, abort action`);
            return;
        }

        const { id: columnName, offsetWidth: columnWidth } = event.element;
        relevantConfig[columnName] = `${columnWidth}px`;

        this._setConfigInCache(relevantConfig);
    }

    public onWindowResize(): void {
        this._logger.info(`handle window resize action by user`, { tableName: this._tableName });
        const relevantConfig = this._getConfig();
        if (!relevantConfig) {
            this._logger.info(`no relevant config found, abort action`);
            return;
        }

        const shouldClearCache = Math.abs(relevantConfig.lastViewPortWidth - this._currentWindowWidth) >= this._windowWidthThreshold;
        if (shouldClearCache) {
            this._removeConfigFromCache();
            delete this._columnsConfig[this._tableName];
        }
    }

    public getConfig(): ResizableColumns {
        this._logger.info(`handle getConfig action by user`, { tableName: this._tableName });
        if (!this._tableName) {
            this._logger.info(`table name is not provided abort action`);
            return null;
        }

        return this._columnsConfig.hasOwnProperty(this._tableName)
            ? this._columnsConfig[this._tableName]
            : this._getConfigFromCache();
    }

    public registerTable(tableName: string): void {
        if (tableName) {
            this._tableName = tableName;
        }
    }
}
