import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Menu, MenuItem } from 'primeng/primeng';

import { AppLocalization } from '@kaltura-ng2/kaltura-common';
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

	private _currentCaption: KalturaCaptionAsset;

    constructor(public _handler : EntryCaptionsHandler, private _appLocalization: AppLocalization) {
    }

	ngOnInit() {
		this._actions = [
			{label: this._appLocalization.get('applications.content.entryDetails.captions.edit'), command: (event) => {this.actionSelected("edit");}},
			{label: this._appLocalization.get('applications.content.entryDetails.captions.download'), command: (event) => {this.actionSelected("download");}},
			{label: this._appLocalization.get('applications.content.entryDetails.captions.delete'), command: (event) => {this.actionSelected("delete");}},
		];
	}

	openActionsMenu(event: any, caption: KalturaCaptionAsset): void{
		if (this.actionsMenu){
			// save the selected caption for usage in the actions menu
			this._currentCaption = caption;
			//disable download action for captions that are not in "ready" state
			if (caption.status.toString() !== KalturaCaptionAssetStatus.Ready.toString()){
				this._actions[1].disabled = true;
			}
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
		}
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

