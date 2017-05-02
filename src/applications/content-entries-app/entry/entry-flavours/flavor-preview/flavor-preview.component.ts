import { Component, Input, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaMediaEntry, FlavorAssetGetUrlAction } from '@kaltura-ng2/kaltura-api/types';
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
	public _previewSource = "";

	constructor(private _kalturaServerClient: KalturaServerClient, private appConfig: AppConfig, private appAuthentication: AppAuthentication) {

	}

	ngAfterViewInit() {
		this._previewSource = "";
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._kalturaServerClient.request(new FlavorAssetGetUrlAction({
							id: this.currentFlavor.id
						}))
							.cancelOnDestroy(this)
							.monitor('get flavor url')
							.subscribe(
								url => {
									this._previewSource = url;								},
								error => {
									console.warn("Error getting flavor URL for flavor ID: " + this.currentFlavor.id);
								}
							);
					}
					if (event.state === PopupWidgetStates.Close) {
						this._previewSource = "";
					}
				});
		}
	}

	ngOnDestroy() {
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

}

