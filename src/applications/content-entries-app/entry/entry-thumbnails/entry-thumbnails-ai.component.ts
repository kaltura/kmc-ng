import { Component, Input } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';


@Component({
    selector: 'kThumbnailAI',
    templateUrl: './entry-thumbnails-ai.component.html',
    styleUrls: ['./entry-thumbnails-ai.component.scss']
})
export class EntryThumbnailAI {

	@Input() entryId: string;
	@Input() parentPopupWidget: PopupWidgetComponent;

    constructor(private _appAuthentication: AppAuthentication) {

    }



}

