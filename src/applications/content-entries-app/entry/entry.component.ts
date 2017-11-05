import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BrowserService } from 'app-shared/kmc-shell';
import { EntryStore, ActionTypes } from './entry-store.service';
import { EntrySectionsListWidget } from './entry-sections-list/entry-sections-list-widget.service';
import { EntryMetadataWidget } from './entry-metadata/entry-metadata-widget.service';
import { EntryPreviewWidget } from './entry-preview/entry-preview-widget.service';
import { EntryDetailsWidget } from './entry-details/entry-details-widget.service';
import { EntryCaptionsWidget } from './entry-captions/entry-captions-widget.service';
import { EntryAccessControlWidget } from './entry-access-control/entry-access-control-widget.service';
import { EntryClipsWidget } from './entry-clips/entry-clips-widget.service';
import { EntryRelatedWidget } from './entry-related/entry-related-widget.service';
import { EntryLiveWidget } from './entry-live/entry-live-widget.service';
import { EntryFlavoursWidget } from './entry-flavours/entry-flavours-widget.service';
import { EntryThumbnailsWidget } from './entry-thumbnails/entry-thumbnails-widget.service';
import { EntrySchedulingWidget } from './entry-scheduling/entry-scheduling-widget.service';
import { EntryUsersWidget } from './entry-users/entry-users-widget.service';
import { EntryWidgetsManager } from './entry-widgets-manager';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';

@Component({
    selector: 'kEntry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
	providers : [
		EntryStore,
		EntryWidgetsManager,
        EntrySectionsListWidget,
        EntryUsersWidget,
        EntryThumbnailsWidget,
        EntrySchedulingWidget,
        EntryRelatedWidget,
        EntryFlavoursWidget,
        EntryLiveWidget,
        EntryClipsWidget,
        EntryCaptionsWidget,
        EntryAccessControlWidget,
        EntryMetadataWidget,
        EntryDetailsWidget,
        EntryPreviewWidget
	]
})
export class EntryComponent implements OnInit, OnDestroy {

	_entryName: string;
	_entryType: KalturaMediaType;

	public _showLoader = false;
	public _areaBlockerMessage: AreaBlockerMessage;
	public _currentEntryId: string;
	public _enablePrevButton: boolean;
	public _enableNextButton: boolean;
	public _entryHasChanges : boolean;

	constructor(
                entryWidgetsManager: EntryWidgetsManager,
                widget1: EntrySectionsListWidget,
                widget2: EntryUsersWidget,
                widget3: EntryThumbnailsWidget,
                widget4: EntrySchedulingWidget,
                widget5: EntryRelatedWidget,
                widget6: EntryFlavoursWidget,
                widget7: EntryLiveWidget,
                widget8: EntryClipsWidget,
                widget9: EntryCaptionsWidget,
                widget10: EntryAccessControlWidget,
                widget11: EntryMetadataWidget,
				widget12: EntryDetailsWidget,
				widget13: EntryPreviewWidget,
				private _entriesStore: EntriesStore,
				private _appLocalization: AppLocalization,
    			public _entryStore: EntryStore) {
        entryWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4, widget5, widget6, widget7, widget8, widget9, widget10, widget11, widget12, widget13]);
    }

	ngOnDestroy() {
	}

	private _updateNavigationState() {
		const entries = this._entriesStore.entries;
		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
			this._enableNextButton = currentEntryIndex >= 0 && (currentEntryIndex < entries.length - 1);
			this._enablePrevButton = currentEntryIndex > 0;

		} else {
			this._enableNextButton = false;
			this._enablePrevButton = false;
		}
	}

	ngOnInit() {
		this._entryStore.state$
            .cancelOnDestroy(this)
            .subscribe(
				status => {

					this._showLoader = false;
					this._areaBlockerMessage = null;

					if (status) {
						switch (status.action) {
							case ActionTypes.EntryLoading:
								this._showLoader = true;

								// when loading new entry in progress, the 'entryID' property
								// reflect the entry that is currently being loaded
								// while 'entry$' stream is null
								this._currentEntryId = this._entryStore.entryId;
								this._updateNavigationState();
								this._entryHasChanges = false;
								break;
							case ActionTypes.EntryLoaded:
								this._entryName = this._entryStore.entry.name;
								this._entryType = this._entryStore.entry.mediaType;
								break;
							case ActionTypes.EntryLoadingFailed:
								let message = status.error ? status.error.message : '';
								message = message || this._appLocalization.get('applications.content.errors.loadError');
								this._areaBlockerMessage = new AreaBlockerMessage({
									message: message,
									buttons: [
										this._createBackToEntriesButton(),
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
											action: () => {
												this._entryStore.reloadEntry();
											}
										}
									]
								});
								break;
							case ActionTypes.EntrySaving:
								this._showLoader = true;
								break;
							case ActionTypes.EntrySavingFailed:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.saveError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.reload'),
											action: () => {
												this._entryStore.reloadEntry();
											}
										}
									]
								});
								break;
							case ActionTypes.EntryDataIsInvalid:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.validationError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
											action: () => {
												this._areaBlockerMessage = null;
											}
										}
									]
								});
								break;
							case ActionTypes.ActiveSectionBusy:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.busyError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
											action: () => {
												this._areaBlockerMessage = null;
											}
										}
									]
								});
								break;
							case ActionTypes.EntryPrepareSavingFailed:

								this._areaBlockerMessage = new AreaBlockerMessage({
									message: this._appLocalization.get('applications.content.entryDetails.errors.savePrepareError'),
									buttons: [
										{
											label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
											action: () => {
												this._areaBlockerMessage = null;
											}
										}
									]
								});
								break;
							default:
								break;
						}
					}
				},
				error => {
					// TODO [kmc] navigate to error page
					throw error;
				});
	}

	private _createBackToEntriesButton(): AreaBlockerMessageButton {
		return {
			label: 'Back To Entries',
			action: () => {
				this._entryStore.returnToEntries();
			}
		};
	}

    public _backToList(){
    	this._entryStore.returnToEntries();
    }

    public _save()
	{
		this._entryStore.saveEntry();
	}

    public _navigateToPrevious() : void
	{
		const entries = this._entriesStore.entries;

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex =  currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex > 0)
			{
				const prevEntry = entries[currentEntryIndex-1];
				this._entryStore.openEntry(prevEntry.id);
			}
		}
	}

	public _navigateToNext() : void
	{
		const entries = this._entriesStore.entries;

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex =  currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex >= 0 && (currentEntryIndex < entries.length -1))
			{
				const nextEntry = entries[currentEntryIndex+1];
				this._entryStore.openEntry(nextEntry.id);
			}
		}
	}

	public canLeave(): Observable<{ allowed : boolean}>{
    	return this._entryStore.canLeave();
	}

}

