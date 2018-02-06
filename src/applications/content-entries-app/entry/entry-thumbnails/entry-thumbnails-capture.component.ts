import { Component, AfterContentInit, Input } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
    selector: 'kThumbnailCapture',
    templateUrl: './entry-thumbnails-capture.component.html',
    styleUrls: ['./entry-thumbnails-capture.component.scss']
})
export class EntryThumbnailCapture implements AfterContentInit{

	@Input() entryId: string;
	@Input() parentPopupWidget: PopupWidgetComponent;

	playerConfig: any;
	kdp: any;

    constructor(private _appAuthentication: AppAuthentication) {
    }

	ngAfterContentInit(){
		this.playerConfig = {
			uiconfid: parseInt(subApplicationsConfig.core.kaltura.previewUIConf),
			pid: this._appAuthentication.appUser.partnerId,
			entryid: this.entryId
		};

	}

	onPlayerReady(kdp){
		this.kdp = kdp;
	}

	_capture(){
		// pass current position
		const context = {
			currentPosition: this.kdp.evaluate('{video.player.currentTime}')
		};
		this.parentPopupWidget.close(context);
	}

}

