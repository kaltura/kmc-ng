import { Component, Input, ViewChild } from '@angular/core';
import { KalturaLogger, LogLevels } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { serverConfig } from 'config/server';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
    selector: 'k-logs-record',
    templateUrl: './logs-record.component.html',
    styleUrls: ['./logs-record.component.scss'],
    providers: [KalturaLogger.createLogger('LogsRecordComponent')]
})
export class LogsRecordComponent {
    @Input() mode: 'link' | 'button';

    @Input() set logLevel(value: LogLevels) {
        if (typeof value === 'string') {
            const capitalizedValue = <LogLevels>(value.charAt(0).toUpperCase() + value.slice(1)); // capitalize string
            const isValidValue = this._logLevelValues.indexOf(capitalizedValue) !== -1;
            if (isValidValue) {
                this._logger.info(`logLevel value received, set logLevel to '${capitalizedValue}'`);
                this._logLevel = capitalizedValue;
            } else {
                this._logger.warn(`invalid logLevel provided (${value}), set logLevel to 'All'`);
                this._logLevel = 'All';
            }
        } else {
            this._logger.warn(`invalid logLevel provided (${value}), set logLevel to 'All'`);
            this._logLevel = 'All';
        }
    }

    @ViewChild('recordPopup') _recordPopup: PopupWidgetComponent;

    private get _supportTeamLink(): string {
        return serverConfig.externalLinks.kaltura.support.replace(':mailto', '');
    }

    public _isRecording = false;
    public _logLevel: LogLevels;

    public _logLevelOptions: { value: LogLevels, label: string }[] = [
        { value: 'All', label: 'All' },
        { value: 'Trace', label: 'Trace' },
        { value: 'Debug', label: 'Debug' },
        { value: 'Info', label: 'Info' },
        { value: 'Warn', label: 'Warn' },
        { value: 'Error', label: 'Error' },
        { value: 'Fatal', label: 'Fatal' }
    ];
    public _logLevelValues = this._logLevelOptions.map(({ value }) => value);

    constructor(private _logger: KalturaLogger,
                private _browserService: BrowserService) {

    }

    private _stopRecord(): void {
        this._recordPopup.open();
    }

    public _sendMailToSupport(): void {
        this._browserService.openEmail(this._supportTeamLink);
    }

    public _startRecord(): void {
        this._isRecording = true;
        this._recordPopup.close();
    }

    public _downloadLogs(): void {
        this._cancel();
    }

    public _cancel(): void {
        this._isRecording = false;
        this._recordPopup.close();
    }

    public _toggleRecord(): void {
        if (!this._isRecording) {
            this._recordPopup.open();
        } else {
            this._stopRecord();
        }
    }
}
