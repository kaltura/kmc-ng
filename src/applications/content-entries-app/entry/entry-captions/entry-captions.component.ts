import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Menu, MenuItem } from 'primeng/primeng';

import { AppLocalization, AppAuthentication, AppConfig } from '@kaltura-ng2/kaltura-common';
import { FileDialogComponent } from '@kaltura-ng2/kaltura-ui';
import { BrowserService } from 'kmc-shell';
import { KalturaCaptionAsset, KalturaCaptionAssetStatus } from '@kaltura-ng2/kaltura-api/types'
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
	@ViewChild('fileDialog') private fileDialog: FileDialogComponent;

	private _currentCaption: KalturaCaptionAsset;

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

	openActionsMenu(event: any, caption: KalturaCaptionAsset): void{
		if (this.actionsMenu){
			// save the selected caption for usage in the actions menu
			this._currentCaption = caption;
			//disable download action for captions that are not in "ready" state
			this._actions[1].disabled = (caption.status !== KalturaCaptionAssetStatus.Ready);
			this._actions[3].disabled = (caption.status !== KalturaCaptionAssetStatus.Ready);

			this.actionsMenu.toggle(event);
		}
	}
	private actionSelected(action: string): void{
		switch (action){
			case "edit":
				alert("edit");
				break;
			case "delete":
				alert("delete");
				break;
			case "download":
				alert("download");
				break;
			case "preview":
				const previewUrl = this._appConfig.get("core.kaltura.apiUrl") + "/service/caption_captionasset/action/serve/captionAssetId/" + this._currentCaption.id +"/ks/" + this._appAuthentication.appUser.ks;
				this._browserService.openLink(previewUrl);
				break;
		}
	}

	public _addCaption(){
		this.fileDialog.open();
	}
    ngOnDestroy() {
    }


    ngAfterViewInit() {

    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

