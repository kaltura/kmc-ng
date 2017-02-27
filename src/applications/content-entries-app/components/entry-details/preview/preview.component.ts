import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';

@Component({
    selector: 'kEntryPreview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

	@Input() currentEntry: KalturaBaseEntry;
	iFrameSrc: string;

    constructor(private route: ActivatedRoute, private appConfig: AppConfig, private appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
	    const entryID = this.route.snapshot.params['id'];
	    const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
	    const partnerID = this.appAuthentication.appUser.partnerId;
	    this.iFrameSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID +'/sp/' + partnerID +'00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID +'?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id='+ entryID;
    }



}

