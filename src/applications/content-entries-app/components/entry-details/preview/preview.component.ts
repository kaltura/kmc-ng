import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppConfig } from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kEntryPreview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

	iFrameSrc: string;

    constructor(private route: ActivatedRoute, private appConfig: AppConfig) {
    }

    ngOnInit() {
    	const entryID = this.route.snapshot.params['id'];
	    const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
	    this.iFrameSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/1944811/sp/194481100/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/1944811?iframeembed=true&entry_id='+ entryID;
    }



}

