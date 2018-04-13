import { Injectable, OnDestroy } from '@angular/core';
import { KalturaLogger, LogLevels } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class KmcLoggerConfigurator implements OnDestroy {
    private _ready = false;

    constructor(private _logger: KalturaLogger) {
        this._logger = _logger.subLogger('KmcLoggerConfigurator');
    }

    ngOnDestroy() {
    }

    private _setLoggerLevel(level: LogLevels): void {
        this._logger.info(`'log' queryParam received, set logLevel to '${level}'`);
        if (this._logger.isValidLogLevel(level)) {
            this._logger.setOptions({ level });
        } else {
            this._logger.info(`'${level}' is not allowed, abort operation`);
        }
    }

    public init(route: ActivatedRoute): void {
        if (!this._ready) {
            this._ready = true;
            this._logger.info(`init service, listen to route's query params`);
            route.queryParams
                .cancelOnDestroy(this)
                .map(params => params['log'])
                .filter(Boolean)
                .subscribe(logLevel => this._setLoggerLevel(logLevel));
        } else {
            this._logger.info(`logger configurator has already initialized, skip init phase`);
        }
    }
}
