import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaSourceType } from 'kaltura-ngx-client/api/types/KalturaSourceType';
import { KalturaLiveStreamBitrate } from 'kaltura-ngx-client/api/types/KalturaLiveStreamBitrate';
import { KalturaRecordStatus } from 'kaltura-ngx-client/api/types/KalturaRecordStatus';
import { KalturaLiveStreamEntry } from 'kaltura-ngx-client/api/types/KalturaLiveStreamEntry';
import { KalturaDVRStatus } from 'kaltura-ngx-client/api/types/KalturaDVRStatus';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { LiveStreamRegenerateStreamTokenAction } from 'kaltura-ngx-client/api/types/LiveStreamRegenerateStreamTokenAction';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';

import { EntryWidgetKeys } from '../entry-widget-keys';
import { LiveXMLExporter } from './live-xml-exporter';
import { AVAIL_BITRATES } from './bitrates';
import { EntryWidget } from '../entry-widget';
import { serverConfig } from 'config/server';
import { ConversionProfileListAction } from 'kaltura-ngx-client/api/types/ConversionProfileListAction';
import { KalturaConversionProfileFilter } from 'kaltura-ngx-client/api/types/KalturaConversionProfileFilter';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

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

	private _conversionProfiles: BehaviorSubject<{ items: any[]}> = new BehaviorSubject<{ items: any[]}>({items: []});
	public _conversionProfiles$ = this._conversionProfiles.asObservable();

	public _recordStatus: string = "";
	public _DVRStatus: string = "";
	public _showDVRWindow: boolean = false;
	public _dvrWindowAvailable: boolean = false;
	public _explicitLive: boolean = true;

	public _selectedConversionProfile: number;
	public _manualStreamsConfiguration = [];
	public _bitrates: bitrate[] = [];
	public _availableBitrates = AVAIL_BITRATES;

	public _autoStartOptions = [
		{label: this._appLocalization.get('applications.content.entryDetails.live.disabled'), value: true},
		{label: this._appLocalization.get('applications.content.entryDetails.live.enabled'), value: false}
	];

	constructor(private _kalturaServerClient: KalturaClient, private _appAuthentication: AppAuthentication, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
		super(EntryWidgetKeys.Live);
	}

	protected onReset() {
		this._DVRStatus = "";
		this._showDVRWindow = false;
		this._dvrWindowAvailable = false;
		this._selectedConversionProfile = null;
		this._explicitLive = true;
		this._manualStreamsConfiguration = [];
		this._bitrates = [];
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
		if (this._liveType === "kaltura") {
			(data as KalturaLiveStreamEntry).explicitLive = this._explicitLive ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue;
			(data as KalturaLiveStreamEntry).conversionProfileId = this._selectedConversionProfile;
		}
	}

	protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean}> {
		return Observable.create(observer => {
			const isValid = this._liveType === "universal" ? this._validateBitrates({updateDirtyMode: false}) : true;
			observer.next({isValid});
			observer.complete()
		});
	}

	protected onActivate(firstTimeActivating : boolean) {
		// set live type and load data accordingly
		switch (this.data.sourceType) {
			case KalturaSourceType.liveStream:
				this._liveType = "kaltura";
				this._setRecordStatus();
				this._setDVRStatus();
				super._showLoader();
				this._conversionProfiles.next({items: []});

				return this._kalturaServerClient.request(new ConversionProfileListAction({
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

					.catch((error, caught) =>
					{
						super._hideLoader();
						super._showActivationError();
						this._conversionProfiles.next({items: []});
						return Observable.throw(error);
					})
					.do(response => {
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
							this._conversionProfiles.next({items: conversionProfiles});
							super._hideLoader();
						}
					});
			case KalturaSourceType.akamaiUniversalLive:
				this._liveType = "universal";
				this._showDVRWindow = true;
				this._setDVRStatus();
				this._setBitrates();
				break;
			case KalturaSourceType.manualLiveStream:
				this._liveType = "manual";
				this._setManualStreams();
				break;
		}
	}

	public _exportXML() {
		const entry = this.data as KalturaLiveStreamEntry;
		const xml: string = LiveXMLExporter.exportXML(entry, this._liveType, this._bitrates);
		this._browserService.download(xml, "export_" + entry.id + ".xml", "text/xml");
	}

	private _setDVRStatus(): void {
		let entry = this.data as KalturaLiveStreamEntry;
		if (!entry.dvrStatus || entry.dvrStatus === KalturaDVRStatus.disabled) {
			this._DVRStatus = this._appLocalization.get('app.common.off');
		} else if (entry.dvrStatus == KalturaDVRStatus.enabled) {
			this._DVRStatus = this._appLocalization.get('app.common.on');
			if (this._liveType === "kaltura") {
				this._showDVRWindow = true;
				this._dvrWindowAvailable = !isNaN(entry.dvrWindow);
			}
		}
		this._explicitLive = entry.explicitLive === KalturaNullableBoolean.trueValue ? true : false;
	}

	private _setRecordStatus(): void {
		let entry = this.data as KalturaLiveStreamEntry;
		if (!entry.recordStatus || entry.recordStatus === KalturaRecordStatus.disabled) {
			this._recordStatus = this._appLocalization.get('app.common.off');
		} else if (entry.recordStatus === KalturaRecordStatus.appended || entry.recordStatus === KalturaRecordStatus.perSession) {
			this._recordStatus = this._appLocalization.get('app.common.on');
		}
	}

	private _setManualStreams(): void {
		let entry: KalturaLiveStreamEntry = this.data as KalturaLiveStreamEntry;
		if (entry.liveStreamConfigurations) {
			entry.liveStreamConfigurations.forEach(streamConfig => {
				let protocol = streamConfig.protocol;
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

	public setDirty():void{
		super.updateState({isValid: true, isDirty: true});
	}

	public regenerateStreamToken(): void {
		this.sectionBlockerMessage = null;
		this._kalturaServerClient.request(new LiveStreamRegenerateStreamTokenAction({entryId: this.data.id}))
			.cancelOnDestroy(this, this.widgetReset$)
			.tag('block-shell')
			.monitor('regenerate stream token')
			.subscribe(
				(response: any) => {
					let entry: KalturaLiveStreamEntry = this.data as KalturaLiveStreamEntry;
					entry.primaryBroadcastingUrl = response.primaryBroadcastingUrl;
					entry.primaryRtspBroadcastingUrl = response.primaryRtspBroadcastingUrl;
					entry.secondaryBroadcastingUrl = response.secondaryBroadcastingUrl;
					entry.secondaryRtspBroadcastingUrl = response.secondaryRtspBroadcastingUrl;
				},
				error => {
					this._showBlockerMessage(new AreaBlockerMessage(
						{
							message: this._appLocalization.get('applications.content.entryDetails.live.regenerateFailure'),
							buttons: [
								{
									label: this._appLocalization.get('app.common.dismiss'),
									action: () => {
										this.sectionBlockerMessage = null;
									}
								},
								{
									label: this._appLocalization.get('app.common.retry'),
									action: () => {
										this.regenerateStreamToken();
									}
								}
							]
						}
					), false);
				}
			);
	}

	public _openLiveReport(): void {
		//const base_url = window.location.protocol + '//' + serverConfig.externalApps.liveAnalytics.uri;
		//const url = base_url + '/apps/liveanalytics/' + serverConfig.externalApps.liveAnalytics.version + '/index.html#/entry/' + this.data.id + '/nonav/';
		//this._browserService.openLink(url);
		this._browserService.alert({
			header: "Note",
			message: "Live Analytics Currently Not Supported"
		});
	}

	ngOnDestroy()
    {

    }
}
