import { Component, ElementRef, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Menu, MenuItem } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaCaptionAssetStatus } from 'kaltura-typescript-client/types/KalturaCaptionAssetStatus'
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { EntryCaptionsWidget } from './entry-captions-widget.service';

import { environment } from 'app-environment';

@Component({
    selector: 'kEntryCaptions',
    templateUrl: './entry-captions.component.html',
    styleUrls: ['./entry-captions.component.scss']
})
export class EntryCaptions implements AfterViewInit, OnInit, OnDestroy {

    public _loadingError = null;
	public _actions: MenuItem[] = [];

	@ViewChild('actionsmenu') private actionsMenu: Menu;
	@ViewChild('editPopup') public editPopup: PopupWidgetComponent;


	private _popupStateChangeSubscribe: ISubscription;
	constructor(public _widgetService: EntryCaptionsWidget, private _appAuthentication: AppAuthentication, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
    }

	ngOnInit() {
        this._widgetService.attachForm();

		this._actions = [
			{label: this._appLocalization.get('applications.content.entryDetails.captions.edit'), command: (event) => {this.actionSelected("edit");}},
			{label: this._appLocalization.get('applications.content.entryDetails.captions.download'), command: (event) => {this.actionSelected("download");}},
			{label: this._appLocalization.get('applications.content.entryDetails.captions.delete'), command: (event) => {this.actionSelected("delete");}},
			{label: this._appLocalization.get('applications.content.entryDetails.captions.preview'), command: (event) => {this.actionSelected("preview");}}
		];
	}

	openActionsMenu(event: any, caption: any): void{
		if (this.actionsMenu){
			// save the selected caption for usage in the actions menu
			this._widgetService.currentCaption = caption;
			//disable actions for captions that are not in "ready" state
			this._actions[0].disabled = (caption.status !== KalturaCaptionAssetStatus.ready);
			this._actions[1].disabled = (caption.status !== KalturaCaptionAssetStatus.ready);
			this._actions[3].disabled = (caption.status !== KalturaCaptionAssetStatus.ready);

			this.actionsMenu.toggle(event);
		}
	}

	ngAfterViewInit(){
		if (this.editPopup) {
			this._popupStateChangeSubscribe = this.editPopup.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Close) {
						if (event.context && event.context.newCaptionFile){
							this._widgetService.upload(event.context.newCaptionFile);
						}
						if (event.context && event.context.newCaptionUrl){
							this._widgetService.currentCaption.uploadUrl = event.context.newCaptionUrl;
						}
						if (event.context){
							this._widgetService.setDirty();
						}
						this._widgetService.removeEmptyCaptions(); // cleanup of captions that don't have assets (url or uploaded file)
					}
				});
		}
	}

	public _addCaption(){
		this._widgetService._addCaption();
		setTimeout( () => {this.editPopup.open(); }, 0); // use a timeout to allow data binding of the new caption to update before opening the popup widget
	}

	private actionSelected(action: string): void{
		switch (action){
			case "edit":
				this.editPopup.open();
				break;
			case "delete":
				this._widgetService.removeCaption();
				break;
			case "download":
				this._downloadFile();
				break;
			case "preview":
				const previewUrl = environment.core.kaltura.apiUrl + "/service/caption_captionasset/action/serve/captionAssetId/" + this._widgetService.currentCaption.id +"/ks/" + this._appAuthentication.appUser.ks;
				this._browserService.openLink(previewUrl);
				break;
		}
	}

	private _downloadFile(): void {
		if (this._browserService.isIE11()) { // IE11 - use download API
			const baseUrl = environment.core.kaltura.cdnUrl;
			const protocol = baseUrl.split(":")[0];
			const partnerId = this._appAuthentication.appUser.partnerId;
			const entryId = this._widgetService.data.id;
			let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + entryId + '/flavorId/' + this._widgetService.currentCaption.id + '/format/download/protocol/' + protocol;
			this._browserService.openLink(url);
		}else {
			const apiUrl = environment.core.kaltura.apiUrl;
			let url = apiUrl + "/service/caption_captionasset/action/serve/ks/" + this._appAuthentication.appUser.ks + "/captionAssetId/" + this._widgetService.currentCaption.id;
			this._browserService.download(url, this._widgetService.currentCaption.id + "." + this._widgetService.currentCaption.fileExt, this._widgetService.currentCaption.fileExt);
		}
	}

    ngOnDestroy() {
	    this.actionsMenu.hide();
	    this._popupStateChangeSubscribe.unsubscribe();

        this._widgetService.detachForm();

	}


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

