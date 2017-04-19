import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/primeng';

import { AppLocalization, AppAuthentication, AppConfig } from '@kaltura-ng2/kaltura-common';
import { BrowserService } from 'kmc-shell';

import { EntryThumbnailsHandler, ThumbnailRow } from './entry-thumbnails-handler';
import { Menu, MenuItem } from 'primeng/primeng';

@Component({
    selector: 'kEntryThumbnails',
    templateUrl: './entry-thumbnails.component.html',
    styleUrls: ['./entry-thumbnails.component.scss']
})
export class EntryThumbnails implements AfterViewInit, OnInit, OnDestroy {

    public _loadingError = null;

	@ViewChild('actionsmenu') private actionsMenu: Menu;
	public _actions: MenuItem[] = [];

	private currentThumb: ThumbnailRow;

    constructor(public _handler : EntryThumbnailsHandler, private _appLocalization: AppLocalization, private _browserService: BrowserService,
                private _appAuthentication: AppAuthentication, private _appConfig:AppConfig, private _confirmationService: ConfirmationService) {
    }

    ngOnInit() {
	    this._actions = [
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.download'), command: (event) => {this.actionSelected("download");}},
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.delete'), command: (event) => {this.actionSelected("delete");}},
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.preview'), command: (event) => {this.actionSelected("preview");}}
	    ];
    }

	openActionsMenu(event: any, thumb: ThumbnailRow): void{
		if (this.actionsMenu){
			this.currentThumb = thumb; // save the selected caption for usage in the actions menu
			this._actions[1].disabled = this.currentThumb.isDefault; // disable delete for default thumbnail
			this.actionsMenu.toggle(event);
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "delete":
				this._confirmationService.confirm({
					message: this._appLocalization.get('applications.content.entryDetails.thumbnails.deleteConfirm'),
					accept: () => {
						this._handler.deleteThumbnail(this.currentThumb.id);
					}
				});
				break;
			case "download":
				this._downloadFile();
				break;
			case "preview":
				this._browserService.openLink(this.currentThumb.url);
				break;
		}
	}

	private _downloadFile(): void {
		//[TODO - KMCNG] - check with Liron why this code is not working
		// const baseUrl = this._appConfig.get('core.kaltura.cdnUrl');
		// const protocol = baseUrl.split(":")[0];
		// const partnerId = this._appAuthentication.appUser.partnerId;
		// const entryId = this._handler.data.id;
		//
		// let url = baseUrl + '/p/' + partnerId +'/sp/' + partnerId + '00/playManifest/entryId/' + entryId + '/flavorId/' + this.currentThumb.id + '/format/download/protocol/' + protocol;
		//
		// this._browserService.openLink(url);
	}
    ngOnDestroy() {
    }

    ngAfterViewInit() {

    }

    _onLoadingAction(actionKey: string) {
        if (actionKey === 'ok') {
			this._handler.closeError();
        }
    }
}
