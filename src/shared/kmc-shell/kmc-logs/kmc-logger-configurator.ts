import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { KalturaLogger, LogLevels } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { BrowserService } from 'app-shared/kmc-shell';

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


    constructor(private _logger: KalturaLogger,
                private _browserService: BrowserService) {
        this._logger = _logger.subLogger('KmcLoggerConfigurator');
    }

    ngOnDestroy() {
        this._logsRecordMode.complete();
    }

    private _getLogLevel(value: string): LogLevels {
        switch ((value || '').toLocaleLowerCase()) {
            case 'all':
                return 'All';
            case 'trace':
                return 'Trace';
            case 'debug':
                return 'Debug';
            case 'info':
                return 'Info';
            case 'warn':
                return 'Warn';
            case 'error':
                return 'Error';
            case 'fatal':
                return 'Fatal';
            case 'off':
                return 'Off';
            default:
                return null;
        }
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

    public init(): void {
        if (!this._ready) {
            this._ready = true;

            const logLevelAsString = this._browserService.getInitialQueryParam('log');
            const logLevel = this._getLogLevel(logLevelAsString);
            const recordLogLevelAsString = this._browserService.getInitialQueryParam('record');
            const recordLogLevel = this._getLogLevel(recordLogLevelAsString);

            if (logLevel || recordLogLevel) {
                console.log(`logger configurator: set log level '${logLevel}' and record log level '${recordLogLevel}'`);
            }

            if (logLevel) {
                this._setLoggerLevel(logLevel);
            }

            if (recordLogLevel) {
                this._enableLogsRecordMode(recordLogLevel);
            }

            this._logger.info(`initialize service, set log level and record log level`, { logLevelAsString, logLevel, recordLogLevelAsString, recordLogLevel});
        } else {
            this._logger.info(`logger configurator has already initialized, skip init phase`);
        }
    }
}
