import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';

import {
	AppConfig,
	AppLocalization
} from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kPlaylistsAdditionalFilter',
    templateUrl: './playlists-additional-filters.component.html',
    styleUrls: ['./playlists-additional-filters.component.scss']
})
export class PlaylistsAdditionalFiltersComponent{
	@Input() parentPopupWidget: PopupWidgetComponent;
	@Input() _createdAfter: Date;
	@Input() _createdBefore: Date;
	public _showLoader = false;
	public _blockerMessage : AreaBlockerMessage = null;
	@Output() createdChanged = new EventEmitter<any>();
	public _createdFilterError: string = null;
	public _createdAtDateRange: string = this._appConfig.get('modules.contentPlaylists.createdAtDateRange');

    constructor(
		private appLocalization: AppLocalization,
		public _appConfig: AppConfig
	) {}

	public _onCreatedChanged() : void
	{
		this._createdFilterError = null;
		if (this._createdBefore && this._createdAfter) {
			const isValid = this._createdAfter <= this._createdBefore;

			if (!isValid)
			{
				this._createdFilterError = this.appLocalization.get('applications.content.playlistsDetails.errors.schedulingError');
				return;
			}
		}
		if (this._createdAfter || this._createdBefore) {
			this._updateDates();
		}
	}

	public _clearCreatedComponents() : void {
		this._createdAfter = null;
		this._createdBefore = null;
		this._createdFilterError = null;
		this._updateDates();
	}

	public _close(){
		if (this.parentPopupWidget){
			this.parentPopupWidget.close();
		}
	}

	// emitting the createdAfter and createdBefore values
	public _updateDates() : void {
		this.createdChanged.emit({
			'createdAfter': this._createdAfter,
			'createdBefore': this._createdBefore
		});
	}
}
