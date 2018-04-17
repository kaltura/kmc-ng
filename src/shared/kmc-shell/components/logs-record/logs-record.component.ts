import { Component, Input } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
    selector: 'k-logs-record',
    templateUrl: './logs-record.component.html',
    styleUrls: ['./logs-record.component.scss'],
    providers: [KalturaLogger.createLogger('LogsRecordComponent')]
})
export class LogsRecordComponent {
    @Input() mode: 'link' | 'button';

    public _isRecording = false;

    constructor(private _logger: KalturaLogger) {

    }

    public _startRecord(): void {

    }

    public _toggleRecord(): void {
        this._isRecording = !this._isRecording;
    }
}
