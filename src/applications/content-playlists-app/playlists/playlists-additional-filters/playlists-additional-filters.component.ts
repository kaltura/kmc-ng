import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kPlaylistsAdditionalFilter',
    templateUrl: './playlists-additional-filters.component.html',
    styleUrls: ['./playlists-additional-filters.component.scss']
})
export class PlaylistsAdditionalFiltersComponent{
	@Input() parentPopupWidget: PopupWidgetComponent;
	public _showLoader = false;
	public _blockerMessage : AreaBlockerMessage = null;
	public _createdAfter: Date;
	public _createdBefore: Date;

    constructor(
		private appLocalization: AppLocalization
	) {}

	public _onCreatedChanged() : void
	{
	}

	public _clearCreatedComponents() : void {
		this._createdAfter = null;
		this._createdBefore = null;
	}

	public _close(){
		if (this.parentPopupWidget){
			this.parentPopupWidget.close();
		}
	}
}
