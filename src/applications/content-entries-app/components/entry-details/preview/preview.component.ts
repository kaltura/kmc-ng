import { Component, OnInit, Input } from '@angular/core';

import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';

@Component({
    selector: 'kEntryPreview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

	@Input() entryId: string;
	@Input() currentEntry: KalturaBaseEntry;
	iFrameSrc: string;

    constructor(private appConfig: AppConfig, private appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
	    const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
	    const partnerID = this.appAuthentication.appUser.partnerId;
	    this.iFrameSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID +'/sp/' + partnerID +'00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID +'?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id='+ this.entryId;
    }



}

