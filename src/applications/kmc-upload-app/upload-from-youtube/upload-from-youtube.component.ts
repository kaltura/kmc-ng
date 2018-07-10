import { Component, Input } from '@angular/core';
import { PopupWidgetComponent, AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaClient } from 'kaltura-ngx-client';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';


@Component({
    selector: 'kKMCUploadFromYoutube',
    templateUrl: './upload-from-youtube.component.html',
    styleUrls: ['./upload-from-youtube.component.scss']
})
export class UploadFromYoutubeComponent {
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _source: string;
    public _isBusy: boolean;
    public _areaBlockerMessage: AreaBlockerMessage;

    constructor(private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _serverClient: KalturaClient) {

    }

    public _upload(): void {
        // TBD
    }
}
