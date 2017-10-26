import { Component, AfterViewInit,OnInit, OnDestroy, ViewChild } from '@angular/core';

import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { BrowserService } from 'app-shared/kmc-shell';

import { EntryThumbnailsWidget, ThumbnailRow } from './entry-thumbnails-widget.service';
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

	constructor(public _widgetService: EntryThumbnailsWidget, private _appLocalization: AppLocalization, private _browserService: BrowserService,
                private _appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
        this._widgetService.attachForm();

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
				this._browserService.confirm(
					{
						header: this._appLocalization.get('applications.content.entryDetails.thumbnails.deleteConfirmHeader'),
						message: this._appLocalization.get('applications.content.entryDetails.thumbnails.deleteConfirm'),
						accept: () => {
							this._widgetService.deleteThumbnail(this.currentThumb.id);
						}
					}
				);
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

		var x = new XMLHttpRequest();
		x.open("GET", this.currentThumb.url, true);
		x.responseType = 'blob';
		x.onload = (e) => {
			return KalturaUtils.download(x.response, this.currentThumb.id + "." + this.currentThumb.fileExt, "image/"+this.currentThumb.fileExt );
		}
		x.send();
	}
    ngOnDestroy() {
	    this.actionsMenu.hide();

		this._widgetService.detachForm();
	}

    ngAfterViewInit() {

    }
}
