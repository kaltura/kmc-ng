import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { RoomThumbnailsWidget, ThumbnailRow } from './room-thumbnails-widget.service';
import { Menu } from 'primeng/menu';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'kRoomThumbnails',
    templateUrl: './room-thumbnails.component.html',
    styleUrls: ['./room-thumbnails.component.scss']
})
export class RoomThumbnails implements OnInit, OnDestroy {

    public _loadingError = false;
	@ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;
	public _actions: MenuItem[] = [];
	public _kmcPermissions = KMCPermissions;
    public _documentWidth: number;

	private currentThumb: ThumbnailRow;

  @HostListener('window:resize', [])
  onWindowResize() {
    this._documentWidth = document.body.clientWidth;
  }

	constructor(public _widgetService: RoomThumbnailsWidget,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
      this._documentWidth = document.body.clientWidth;
      this._widgetService.attachForm();

	    this._actions = [
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.download'), command: (event) => {this.actionSelected("download");}},
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.preview'), command: (event) => {this.actionSelected("preview");}},
		    {label: this._appLocalization.get('applications.content.entryDetails.thumbnails.delete'), styleClass: 'kDanger', command: (event) => {this.actionSelected("delete");}}
	    ];
    }

	openActionsMenu(event: any, thumb: ThumbnailRow): void{
		if (this.actionsMenu){
			this.currentThumb = thumb; // save the selected caption for usage in the actions menu
			this._actions[2].disabled = this.currentThumb.isDefault; // disable delete for default thumbnail
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

    public _onThumbLoadError(event): void {
        event.target.style.display = 'none';
        this._loadingError = true;
    }
}
