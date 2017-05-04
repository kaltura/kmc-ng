import { Component, Input, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMediaEntry, FlavorAssetGetUrlAction } from 'kaltura-typescript-client/types';
import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { Flavor } from '../entry-flavours-handler';

@Component({
	selector: 'kFlavorPreview',
	templateUrl: './flavor-preview.component.html',
	styleUrls: ['./flavor-preview.component.scss']
})
export class FlavorPreview implements AfterViewInit, OnDestroy {

	@Input() currentFlavor: Flavor;
	@Input() currentEntry: KalturaMediaEntry;
	@Input() parentPopupWidget: PopupWidgetComponent;

	private _parentPopupStateChangeSubscribe: ISubscription;
	public _iframeSrc = "";

	constructor(private _kalturaServerClient: KalturaClient, private appConfig: AppConfig, private appAuthentication: AppAuthentication) {

	}

	ngAfterViewInit() {
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						const dimensions = this.currentFlavor.dimensions.split(" x ");
						const width: number = dimensions.length === 2 ? parseInt(dimensions[0]) : 0;
						const height: number = dimensions.length === 2 ? parseInt(dimensions[1]) : 0;
						this._kalturaServerClient.request(new FlavorAssetGetUrlAction({
							id: this.currentFlavor.id
						}))
							.cancelOnDestroy(this)
							.monitor('get flavor url')
							.subscribe(
								url => {
									const mediaProxy = {
										'sources': [
											{
												"src": url,
												"width": width,
												"height": height,
												"bandwidth": this.currentFlavor.bitrate,
												"type": "video/mp4; codecs=\"avc1.42E01E, mp4a.40.2"
											}
										]
									}
									const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
									const partnerID = this.appAuthentication.appUser.partnerId;
									const ks = this.appAuthentication.appUser.ks || "";
									this._iframeSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID + '/sp/' + partnerID + '00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID + '?iframeembed=true&flashvars[mediaProxy]=' + JSON.stringify(mediaProxy) +'&flashvars[EmbedPlayer.SimulateMobile]=true&flashvars[ks]=' + ks +'&flashvars[EmbedPlayer.EnableMobileSkin]=true';
								},
								error => {
									console.warn("Error getting flavor URL for flavor ID: " + this.currentFlavor.id);
								}
							);
					}
				});
		}
	}

	ngOnDestroy() {
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

}

