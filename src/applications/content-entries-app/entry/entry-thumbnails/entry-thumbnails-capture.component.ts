import { Component, AfterContentInit, Input } from '@angular/core';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { serverConfig, getKalturaServerUri } from 'config/server';

@Component({
    selector: 'kThumbnailCapture',
    templateUrl: './entry-thumbnails-capture.component.html',
    styleUrls: ['./entry-thumbnails-capture.component.scss']
})
export class EntryThumbnailCapture implements AfterContentInit{

	@Input() entryId: string;
	@Input() parentPopupWidget: PopupWidgetComponent;

    serverUri = getKalturaServerUri();
    playerConfig: any;
    player: any;

    constructor(private _appAuthentication: AppAuthentication) {
    }

	ngAfterContentInit(){
		this.playerConfig = {
			uiconfid: serverConfig.kalturaServer.previewUIConfV7,
			pid: this._appAuthentication.appUser.partnerId,
			entryid: this.entryId,
            ks: this._appAuthentication.appUser.ks
		};

	}

    onPlayerInitialized(player){
		this.player = player;
	}

	_capture(){
		// pass current position
		const context = {
			currentPosition: this.player.currentTime
		};
		this.parentPopupWidget.close(context);
	}

}

