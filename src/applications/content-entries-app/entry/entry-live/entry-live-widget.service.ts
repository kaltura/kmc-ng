import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Message } from 'primeng/primeng';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';
import { KalturaLiveStreamBitrate } from 'kaltura-typescript-client/types/KalturaLiveStreamBitrate';
import { KalturaRecordStatus } from 'kaltura-typescript-client/types/KalturaRecordStatus';
import { KalturaLiveStreamEntry } from 'kaltura-typescript-client/types/KalturaLiveStreamEntry';
import { KalturaDVRStatus } from 'kaltura-typescript-client/types/KalturaDVRStatus';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';

import { EntryWidgetKeys } from '../entry-widget-keys';


import { LiveXMLExporter } from './live-xml-exporter';
import { AVAIL_BITRATES } from './bitrates';
import { environment } from 'app-environment';
import { EntryWidget } from '../entry-widget';

export interface bitrate {
	enabled: boolean,
	bitrate: number,
	width: number,
	height: number,
	errors: string
}

@Injectable()
export class EntryLiveWidget extends EntryWidget implements OnDestroy {

	public _liveType: string = "";
	private dirty: boolean;

	private _conversionProfiles: BehaviorSubject<{ items: any[], loading: boolean, error?: any}> =
		new BehaviorSubject<{ items: any[], loading: boolean, error?: any}>({items: [], loading: false});
	public _conversionProfiles$ = this._conversionProfiles.asObservable();

	public _regeneratingToken: boolean = false;
	public _recordStatus: string = "";
	public _DVRStatus: string = "";
	public _showDVRWindow: boolean = false;

	public _selectedConversionProfile: number;
	public _manualStreamsConfiguration = [];
	public _bitrates: bitrate[] = [];
	public _availableBitrates = AVAIL_BITRATES;

	constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
		super(EntryWidgetKeys.Live);
	}

	protected onReset() {
		this.dirty = false;
	}

	protected onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest) {
		if (this._liveType === "universal") {
			// create bitrate array for saving
			let bitrates: KalturaLiveStreamBitrate[] = [];
			this._bitrates.forEach((br: bitrate) => {
				if (br.enabled) {
					bitrates.push(new KalturaLiveStreamBitrate({
						bitrate: br.bitrate,
						width: br.width,
						height: br.height
					}));
				}
			});
			(data as KalturaLiveStreamEntry).bitrates = bitrates;
		}
	}

	protected onValidate(): Observable<{ isValid: boolean}> {
		return Observable.create(observer => {
			const isValid = this._liveType === "universal" ? this._validateBitrates({updateDirtyMode: false}) : true;
			observer.next({isValid});
			observer.complete()
		});
	}

	protected onActivate(firstTimeActivating : boolean) {
		// set live type
		switch (this.data.sourceType.toString()) {
			case KalturaSourceType.liveStream.toString():
				this._liveType = "kaltura";
				// this._fetchConversionProfiles();
				// this._setRecordStatus();
				// this._setDVRStatus();
				break;
			case KalturaSourceType.akamaiUniversalLive.toString():
				this._liveType = "universal";
				this._showDVRWindow = true;
				this._setDVRStatus();
				this._setBitrates();
				break;
			case KalturaSourceType.manualLiveStream.toString():
				this._liveType = "manual";
				this._setManualStreams();
				break;
		}
	}

	/*
	 private _fetchConversionProfiles(): void {
	 this._conversionProfiles.next({items: [], loading: true});

	 this._kalturaServerClient.request(new ConversionProfileListAction({
	 filter: new KalturaConversionProfileFilter({
	 typeEqual: KalturaConversionProfileType.liveStream
	 }),
	 pager: new KalturaFilterPager({
	 pageIndex: 1,
	 pageSize: 500
	 })
	 }))
	 .cancelOnDestroy(this, this.widgetReset$)
	 .monitor('get conversion profiles')
	 .subscribe(
	 response => {
	 if (response.objects && response.objects.length) {
	 // set the default profile first in the array
	 response.objects.sort(function (a, b) {
	 if (a.isDefault > b.isDefault)
	 return -1;
	 if (a.isDefault < b.isDefault)
	 return 1;
	 return 0;
	 });
	 // create drop down options array
	 let conversionProfiles = [];
	 response.objects.forEach(profile => {
	 conversionProfiles.push({label: profile.name, value: profile.id});
	 if (this.data.conversionProfileId === profile.id) {
	 this._selectedConversionProfile = profile.id; // preselect this profile in the profiles drop-down
	 }
	 });
	 this._conversionProfiles.next({items: conversionProfiles, loading: false});
	 }
	 },
	 error => {
	 this._conversionProfiles.next({items: [], loading: false, error: error});
	 }
	 );
	 }

	 public regenerateStreamToken(): void {
	 this._regeneratingToken = true;
	 this._kalturaServerClient.request(new LiveStreamRegenerateStreamTokenAction({entryId: this.data.id}))
	 .cancelOnDestroy(this, this.widgetReset$)
	 .monitor('regenerate stream token')
	 .subscribe(
	 response => {
	 this._regeneratingToken = false;
   this._browserService.showGrowlMessage({severity: 'success', detail: this._appLocalization.get('applications.content.entryDetails.live.regenerateSuccess')});
	 },
	 error => {
	 this._regeneratingToken = false;
   this._browserService.showGrowlMessage({severity: 'error', detail: this._appLocalization.get('applications.content.entryDetails.live.regenerateFailure')});
	 }
	 );
	 }
	 */

	public _openLiveReport(): void {
		const base_url = window.location.protocol + '//' + environment.core.kaltura.kmcUrl;
		const url = base_url + '/apps/liveanalytics/' + environment.core.kaltura.liveAnalyticsVersion + '/index.html#/entry/' + this.data.id + '/nonav';
		this._browserService.openLink(url);
	}

	public _exportXML() {
		const entry = this.data as KalturaLiveStreamEntry;
		const xml: string = LiveXMLExporter.exportXML(entry, this._liveType, this._bitrates);
		this._browserService.download(xml, "export_" + entry.id + ".xml", "text/xml");
	}

	private _setDVRStatus(): void {
		let entry = this.data as KalturaLiveStreamEntry;
		if (!entry.dvrStatus || entry.dvrStatus.toString() === KalturaDVRStatus.disabled.toString()) {
			this._DVRStatus = this._appLocalization.get('app.common.off');
		} else if (entry.dvrStatus.toString() == KalturaDVRStatus.enabled.toString()) {
			this._DVRStatus = this._appLocalization.get('app.common.on');
			if (this._liveType === "kaltura") {
				this._showDVRWindow = true;
			}
		}
	}

	private _setRecordStatus(): void {
		let entry = this.data as KalturaLiveStreamEntry;
		if (!entry.recordStatus || entry.recordStatus.toString() === KalturaRecordStatus.disabled.toString()) {
			this._recordStatus = this._appLocalization.get('app.common.off');
		} else if (entry.recordStatus.toString() === KalturaRecordStatus.appended.toString() || entry.recordStatus.toString() === KalturaRecordStatus.perSession.toString()) {
			this._recordStatus = this._appLocalization.get('app.common.on');
		}
	}

	private _setManualStreams(): void {
		let entry: KalturaLiveStreamEntry = this.data as KalturaLiveStreamEntry;
		if (entry.liveStreamConfigurations) {
			entry.liveStreamConfigurations.forEach(streamConfig => {
				let protocol = streamConfig.protocol.toString();
				let postfix = this._appLocalization.get('applications.content.entryDetails.live.streamUrl');
				this._manualStreamsConfiguration.push({label: protocol + " " + postfix, url: streamConfig.url});
			});
		}
	}

	private _setBitrates(): void {
		this._bitrates = [];
		let entry: KalturaLiveStreamEntry = this.data as KalturaLiveStreamEntry;
		if (entry.bitrates) {
			entry.bitrates.forEach((br: KalturaLiveStreamBitrate) => {
				let bitRate: bitrate = {
					enabled: true,
					bitrate: br.bitrate,
					width: br.width,
					height: br.height,
					errors: ""
				};
				this._bitrates.push(bitRate);
			});
			// prepare empty bitrate slots for missing bitrates
			while (this._bitrates.length < 3) {
				this._bitrates.push({enabled: false, bitrate: 0, width: 0, height: 0, errors: ""});
			}
		}
	}
	public _validateBitrates({updateDirtyMode} : {updateDirtyMode: boolean}): boolean {
		let valid = true;
		this._bitrates.forEach((br: bitrate) => {
			br.errors = "";
			if (br.enabled) {
				if (br.bitrate > 0) {
					if (br.width === 0 || br.height === 0) {
						valid = false;
						br.errors = this._appLocalization.get('applications.content.entryDetails.live.dimensionsError');
					}
				} else {
					valid = false;
					br.errors = this._appLocalization.get('applications.content.entryDetails.live.bitrateError');
				}
			}
		});
		const newStatus: any = {isValid: valid};

		if (updateDirtyMode)
		{
			newStatus.isDirty = true;
		}

		super.updateState(newStatus);

		return valid;
	}

    ngOnDestroy()
    {

    }
}
