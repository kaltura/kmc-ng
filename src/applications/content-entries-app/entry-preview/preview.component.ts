import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EntryStore } from '../entry-store/entry-store.service';


import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaMediaEntry, KalturaEntryStatus, KalturaSourceType, KalturaMediaType } from '@kaltura-ng2/kaltura-api/types';
import { BrowserService } from 'kmc-shell';

@Component({
    selector: 'kEntryPreview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

	@Input() set entryId(entryId: string){
		this._entryId = entryId;
		this.reloadEntry();
	}
	get entryId(): string { return this._entryId; }

	public _entryReady: boolean = false;
	public _iFrameSrc: string;
	public _landingPage: string;
	public _isLive: boolean = false;
	public _isRecordedLive: boolean = false;
	public _hasDuration: boolean = false;
	public _isClip: boolean = false;

	private _currentEntry: KalturaMediaEntry;
	private _entryId: string;

	@Input() set currentEntry(entry: KalturaMediaEntry) {
		this._currentEntry = entry;

		if (this._currentEntry){
			this._entryReady = this._currentEntry.status !== KalturaEntryStatus.NoContent;
			const sourceType = this._currentEntry.sourceType.toString();
			this._isLive = (sourceType === KalturaSourceType.LiveStream.toString() ||
				sourceType === KalturaSourceType.AkamaiLive.toString() ||
				sourceType === KalturaSourceType.AkamaiUniversalLive.toString() ||
				sourceType === KalturaSourceType.ManualLiveStream.toString());
			this._isRecordedLive = (sourceType === KalturaSourceType.RecordedLive.toString());
			this._hasDuration = (this._currentEntry.status !== KalturaEntryStatus.NoContent && !this._isLive && this._currentEntry.mediaType.toString() !== KalturaMediaType.Image.toString());
			this._isClip = !this._isRecordedLive && (this._currentEntry.id !== this._currentEntry.rootEntryId);
		}

	}
	get currentEntry(): KalturaMediaEntry { return this._currentEntry; }



    constructor(private appConfig: AppConfig, private appAuthentication: AppAuthentication, private router: Router, private browserService: BrowserService,public _entryStore: EntryStore) {
    }

    ngOnInit() {
    	this.reloadEntry();
    }

    private reloadEntry(){

	    this._landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
	    if (this._landingPage) {
			this._landingPage.replace("{entryId}", this._entryId);
		}

	    const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
	    const partnerID = this.appAuthentication.appUser.partnerId;
	    this._iFrameSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID +'/sp/' + partnerID +'00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID +'?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id='+ this._entryId;
    }

	openPreviewAndEmbed(){
		alert("Open Preview & Embed Window");
	}

	openLandingPage(){
		this.browserService.openLink(this._landingPage);
	}

	navigateToEntry(entryId){
		this._entryStore.openEntry(entryId);
	}

}

