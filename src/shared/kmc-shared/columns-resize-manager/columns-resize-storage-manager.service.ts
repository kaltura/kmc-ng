import { Inject, Injectable, InjectionToken, Renderer2 } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell';

export interface ResizableColumns {
    [columnName: string]: string | number;
    lastViewPortWidth?: number;
}

export interface ResizableColumnsConfig {
    [tableName: string]: ResizableColumns;
}

@Injectable()
export class ColumnsResizeStorageManagerService {
    private readonly _windowWidthThreshold = 20;
    private _columnsConfig: ResizableColumnsConfig = {};

    private get _currentWindowWidth(): number {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    constructor(private _logger: KalturaLogger,
                private _browserService: BrowserService) {
        this._logger = _logger.subLogger('ColumnsResizeStorageManagerService');
    }

    private _getCacheToken(tableName: string): string {
        return tableName ? `resizable-columns.${tableName}` : null;
    }

    private _getConfigFromCache(tableName: string): ResizableColumns {
        const cacheToken = this._getCacheToken(tableName);
        this._logger.info(`load columns config from the local storage`, { cacheToken, tableName });
        if (cacheToken) {
            const config = this._browserService.getFromLocalStorage(cacheToken);
            try {
                this._columnsConfig[tableName] = JSON.parse(config) || { lastViewPortWidth: this._currentWindowWidth };
                return this._columnsConfig[tableName];
            } catch (e) {
                this._logger.warn(`couldn't load config from the local storage, return empty array`, { errorMessage: e.message });
                return { lastViewPortWidth: this._currentWindowWidth };
            }
        }

        return { lastViewPortWidth: this._currentWindowWidth };
    }

    private _removeConfigFromCache(tableName: string): void {
        const cacheToken = this._getCacheToken(tableName);
        this._logger.info(`handle remove config from cache action`, { cacheToken, tableName });
        if (cacheToken) {
            try {
                this._browserService.removeFromLocalStorage(cacheToken);
                delete this._columnsConfig[tableName];
            } catch (e) {
                this._logger.warn(`couldn't load config from the local storage, return empty array`, { errorMessage: e.message });
            }
        }
    }

    public getConfig(tableName: string): ResizableColumns {
        if (!tableName) {
            return null;
        }

        if (this._columnsConfig.hasOwnProperty(tableName)) {
            return this._columnsConfig[tableName];
        }

        this._columnsConfig[tableName] = { lastViewPortWidth: this._currentWindowWidth };

        return this._columnsConfig[tableName];
    }

    public loadConfig(tableName: string): ResizableColumns {
        this._logger.info(`handle getConfig action by user`, { tableName });
        if (!tableName) {
            this._logger.info(`table name is not provided abort action`);
            return null;
        }

        const relevantConfig = Object.assign({}, this._columnsConfig.hasOwnProperty(tableName)
            ? this._columnsConfig[tableName]
            : this._getConfigFromCache(tableName)
        );

        const shouldClearCache = Math.abs(relevantConfig.lastViewPortWidth - this._currentWindowWidth) >= this._windowWidthThreshold;
        if (shouldClearCache) {
            this._logger.info(`previous viewport width was different, reset cache`, {
                prevVW: relevantConfig.lastViewPortWidth,
                currVW: this._currentWindowWidth,
            });
            this._removeConfigFromCache(tableName);

            this._columnsConfig[tableName] = { lastViewPortWidth: this._currentWindowWidth };
            return {};
        }

        delete relevantConfig['lastViewPortWidth'];

        return relevantConfig;
    }

    public setConfigInCache(config: ResizableColumns, tableName: string): void {
        this._logger.info(`set config in the local storage`, { tableName });
        const cacheToken = this._getCacheToken(tableName);
        if (cacheToken) {
            try {
                this._browserService.setInLocalStorage(cacheToken, JSON.stringify(config));
                this._columnsConfig[tableName] = Object.assign(this._columnsConfig[tableName], config);
            } catch (e) {
                this._logger.warn(`couldn't set updated config to the local storage, do nothing`, { errorMessage: e.message });
            }
        }
    }
}
