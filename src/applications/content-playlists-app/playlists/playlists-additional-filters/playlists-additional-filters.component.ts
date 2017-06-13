import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';

import {
	AppConfig,
	AppLocalization
} from '@kaltura-ng2/kaltura-common';

import { PlaylistsStore } from "../playlists-store/playlists-store.service";
import { CreatedAtFilter } from "../playlists-store/filters/created-at-filter";

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
	public _createdFilterError: string = null;
	public _createdAtDateRange: string = this._appConfig.get('modules.contentPlaylists.createdAtDateRange');

    constructor(
    	private playlistsStore : PlaylistsStore,
		private appLocalization: AppLocalization,
		public _appConfig: AppConfig
	) {}

	public _onCreatedChanged() : void
	{
		this.syncCreatedFilters();
	}

	private syncCreatedComponents() : void {

		const createdAtFilter = this.playlistsStore.getFirstFilterByType(CreatedAtFilter);

		if (createdAtFilter)
		{
			this._createdAfter = createdAtFilter.createdAfter;
			this._createdBefore = createdAtFilter.createdBefore;
		}else
		{
			this._createdAfter = null;
			this._createdBefore = null;
		}
	}

	private syncCreatedFilters()
	{
		this._createdFilterError = null;
		if (this._createdBefore && this._createdAfter) {
			const isValid = this._createdAfter <= this._createdBefore;

			if (!isValid)
			{
				setTimeout(this.syncCreatedComponents.bind(this),0);

				this._createdFilterError = this.appLocalization.get('applications.content.playlistsDetails.errors.schedulingError');
				return;
			}
		}

		this.playlistsStore.removeFiltersByType(CreatedAtFilter);

		if (this._createdAfter || this._createdBefore)
		{
			this.playlistsStore.addFilters(new CreatedAtFilter(KalturaUtils.getStartDateValue(this._createdAfter), KalturaUtils.getEndDateValue(this._createdBefore)));
		}
	}

	public _clearCreatedComponents() : void {
		this._createdAfter = null;
		this._createdBefore = null;
		this.syncCreatedFilters();
	}

	public _close(){
		if (this.parentPopupWidget){
			this.parentPopupWidget.close();
		}
	}
}
