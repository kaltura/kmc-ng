import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { BrowserService } from 'app-shared/kmc-shell';
import { EntryStore, ActionTypes } from './entry-store.service';
import { EntrySectionsListHandler } from './entry-sections-list/entry-sections-list-handler';
import { EntryMetadataHandler } from './entry-metadata/entry-metadata-handler';
import { EntryPreviewHandler } from './entry-preview/entry-preview-handler';
import { EntryDetailsHandler } from './entry-details/entry-details-handler';
import { EntryCaptionsHandler } from './entry-captions/entry-captions-handler';
import { EntryAccessControlHandler } from './entry-access-control/entry-access-control-handler';
import { EntryClipsHandler } from './entry-clips/entry-clips-handler';
import { EntryRelatedHandler } from './entry-related/entry-related-handler';
import { EntryLiveHandler } from './entry-live/entry-live-handler';
import { EntryFlavoursHandler } from './entry-flavours/entry-flavours-handler';
import { EntryThumbnailsHandler } from './entry-thumbnails/entry-thumbnails-handler';
import { EntrySchedulingHandler } from './entry-scheduling/entry-scheduling-handler';
import { EntryUsersHandler } from './entry-users/entry-users-handler';
import { EntryFormManager } from './entry-form-manager';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { EntryFormWidget } from './entry-form-widget';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';

@Component({
    selector: 'kEntry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
	providers : [
		EntryStore,
		EntryFormManager,
		{
			provide: EntryFormWidget,
			useClass: EntrySectionsListHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryUsersHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryThumbnailsHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntrySchedulingHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryRelatedHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryFlavoursHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryLiveHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryClipsHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryCaptionsHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryAccessControlHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryMetadataHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryPreviewHandler,
			multi: true
		},
		{
			provide: EntryFormWidget,
			useClass: EntryDetailsHandler,
			multi: true
		}
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

	constructor(public _entryStore: EntryStore,
				private  _entriesStore: EntriesStore,
				private _entryFormManager : EntryFormManager,
				private _browserService: BrowserService,
				@Inject(EntryFormWidget)private  _widgets : EntryFormWidget[],
				private _appLocalization: AppLocalization) {

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

		this._entryFormManager.registerWidgets(this._widgets);

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

