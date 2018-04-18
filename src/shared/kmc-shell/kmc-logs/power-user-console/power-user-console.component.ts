import { Component } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
    selector: 'k-power-user-console',
    templateUrl: './power-user-console.component.html',
    styleUrls: ['./power-user-console.component.scss'],
    providers: [KalturaLogger.createLogger('LogsRecordComponent')]
})
export class PowerUserConsoleComponent {
    public _display = false;

    constructor(private _logger: KalturaLogger) {

    }

    public _openPowerUserPanel(): void {
        this._logger.info('open powerUserConsole by user');
        this._display = true;
    }
}
