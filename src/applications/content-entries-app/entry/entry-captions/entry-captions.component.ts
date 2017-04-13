import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Menu, MenuItem } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization, AppAuthentication, AppConfig } from '@kaltura-ng2/kaltura-common';
import { BrowserService } from 'kmc-shell';
import { KalturaCaptionAssetStatus } from '@kaltura-ng2/kaltura-api/types'
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

import { EntryCaptionsHandler } from './entry-captions-handler';

@Component({
    selector: 'kEntryCaptions',
    templateUrl: './entry-captions.component.html',
    styleUrls: ['./entry-captions.component.scss']
})
export class EntryCaptions implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;
	public _actions: MenuItem[] = [];

	@ViewChild('actionsmenu') private actionsMenu: Menu;
	@ViewChild('editPopup') public editPopup: PopupWidgetComponent;

	private _popupStateChangeSubscribe: ISubscription;

    constructor(public _handler : EntryCaptionsHandler, private _appAuthentication: AppAuthentication, private _appConfig:AppConfig, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
    }

	ngOnInit() {
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
			this._handler.currentCaption = caption;
			//disable actions for captions that are not in "ready" state
			this._actions[0].disabled = (caption.status !== KalturaCaptionAssetStatus.Ready);
			this._actions[1].disabled = (caption.status !== KalturaCaptionAssetStatus.Ready);
			this._actions[3].disabled = (caption.status !== KalturaCaptionAssetStatus.Ready);

			this.actionsMenu.toggle(event);
		}
	}

	ngAfterViewInit(){
		if (this.editPopup) {
			this._popupStateChangeSubscribe = this.editPopup.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Close) {
						if (event.context && event.context.newCaptionFile){
							this._handler.upload(event.context.newCaptionFile);
						}
						if (event.context && event.context.newCaptionUrl){
							this._handler.currentCaption.uploadUrl = event.context.newCaptionUrl;
						}
						this._handler.removeEmptyCaptions(); // cleanup of captions that don't have assets (url or uploaded file)
					}
				});
		}
	}

	public _addCaption(){
		this._handler._addCaption();
		setTimeout( () => {this.editPopup.open(); }, 0); // use a timeout to allow data binding of the new caption to update before opening the popup widget
	}

	private actionSelected(action: string): void{
		switch (action){
			case "edit":
				this.editPopup.open();
				break;
			case "delete":
				this._handler.removeCaption();
				break;
			case "download":
				this._downloadFile();
				break;
			case "preview":
				const previewUrl = this._appConfig.get("core.kaltura.apiUrl") + "/service/caption_captionasset/action/serve/captionAssetId/" + this._handler.currentCaption.id +"/ks/" + this._appAuthentication.appUser.ks;
				this._browserService.openLink(previewUrl);
				break;
		}
	}

	private _downloadFile(): void {

		const baseUrl = this._appConfig.get('core.kaltura.cdnUrl');
		const protocol = baseUrl.split(":")[0];
		const partnerId = this._appAuthentication.appUser.partnerId;
		const entryId = this._handler.data.id;

		let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + entryId + '/flavorId/' + this._handler.currentCaption.id + '/format/download/protocol/' + protocol;

		this._browserService.openLink(url);
	}

    ngOnDestroy() {
	    this._popupStateChangeSubscribe.unsubscribe();
    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

