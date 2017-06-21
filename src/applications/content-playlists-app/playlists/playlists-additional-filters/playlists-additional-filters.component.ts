import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
import { environment } from 'app-environment';

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
	public _createdAtDateRange: string = environment.modules.contentPlaylists.createdAtDateRange;

   constructor() {}

	public _onCreatedChanged() : void
	{
		if (this._createdAfter || this._createdBefore) {
			this._updateDates();
		}
	}

	public _clearCreatedComponents() : void {
		this._createdAfter = null;
		this._createdBefore = null;
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
