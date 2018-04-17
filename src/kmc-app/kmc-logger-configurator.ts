import { Injectable, OnDestroy } from '@angular/core';
import { KalturaLogger, LogLevels } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface LogsRecordMode {
    enabled: boolean;
    logLevel: LogLevels;
}

@Injectable()
export class KmcLoggerConfigurator implements OnDestroy {
    private _ready = false;
    private _logsRecordMode = new BehaviorSubject<LogsRecordMode>({ enabled: false, logLevel: 'Off' });

    public get logsRecordMode(): Observable<LogsRecordMode> {
        return this._logsRecordMode.asObservable();
    }

    constructor(private _logger: KalturaLogger) {
        this._logger = _logger.subLogger('KmcLoggerConfigurator');
    }

    ngOnDestroy() {
        this._logsRecordMode.complete();
    }

    private _setLoggerLevel(level: LogLevels): void {
        this._logger.info(`'log' queryParam received, set logLevel to '${level}'`);
        if (this._logger.isValidLogLevel(level)) {
            this._logger.setOptions({ level });
        } else {
            this._logger.info(`'${level}' is not allowed, abort operation`);
        }
    }

    private _enableLogsRecordMode(logLevel: LogLevels): void {
        this._logger.info(`'record' queryParam received, enable logs record mode with preselected ${logLevel} logs level `);
        this._logsRecordMode.next({
            enabled: true,
            logLevel
        });
    }

    public init(route: ActivatedRoute): void {
        if (!this._ready) {
            this._ready = true;
            this._logger.info(`init service, listen to route's query params`);
            route.queryParams
                .cancelOnDestroy(this)
                .subscribe(params => {
                    if (params['log']) {
                        this._setLoggerLevel(params['log']);
                    }
                    if (params['record']) {
                        this._enableLogsRecordMode(params['record']);
                    }
                });
        } else {
            this._logger.info(`logger configurator has already initialized, skip init phase`);
        }
    }
}
