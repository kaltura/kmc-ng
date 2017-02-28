import { Component, OnInit, Input } from '@angular/core';

import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaBaseEntry, KalturaEntryStatus } from '@kaltura-ng2/kaltura-api/types';

@Component({
    selector: 'kEntryPreview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

	@Input() entryId: string;

	entryReady: boolean = false;
	private _currentEntry: KalturaBaseEntry;

	@Input() set currentEntry(entry: KalturaBaseEntry) {
		this._currentEntry = entry;
		this.entryReady = this._currentEntry ? this._currentEntry.status !== KalturaEntryStatus.NoContent : false;
	}
	get currentEntry(): KalturaBaseEntry { return this._currentEntry; }

	public _iFrameSrc: string;
	//public _landingPage: string;

    constructor(private appConfig: AppConfig, private appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
	    const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
	    const partnerID = this.appAuthentication.appUser.partnerId;
	    this._iFrameSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID +'/sp/' + partnerID +'00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID +'?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id='+ this.entryId;
		//this._landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
    }

	openPreviewAndEmbed(){
		alert("Open Preview & Embed Window");
	}

}

