import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {KalturaMediaType} from 'kaltura-ngx-client';
import { ActionTypes, EntryStore, NotificationTypes } from './entry-store.service';
import {EntrySectionsListWidget} from './entry-sections-list/entry-sections-list-widget.service';
import {EntryMetadataWidget} from './entry-metadata/entry-metadata-widget.service';
import {EntryPreviewWidget} from './entry-preview/entry-preview-widget.service';
import {EntryDetailsWidget} from './entry-details/entry-details-widget.service';
import {EntryCaptionsWidget} from './entry-captions/entry-captions-widget.service';
import {EntryAccessControlWidget} from './entry-access-control/entry-access-control-widget.service';
import {EntryClipsWidget} from './entry-clips/entry-clips-widget.service';
import {EntryRelatedWidget} from './entry-related/entry-related-widget.service';
import {EntryLiveWidget} from './entry-live/entry-live-widget.service';
import {EntryFlavoursWidget} from './entry-flavours/entry-flavours-widget.service';
import {EntryThumbnailsWidget} from './entry-thumbnails/entry-thumbnails-widget.service';
import {EntrySchedulingWidget} from './entry-scheduling/entry-scheduling-widget.service';
import {EntryUsersWidget} from './entry-users/entry-users-widget.service';
import {EntryWidgetsManager} from './entry-widgets-manager';
import {AreaBlockerMessage, AreaBlockerMessageButton} from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import {EntriesStore} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import {EntryDistributionWidget} from './entry-distribution/entry-distribution-widget.service';
import {EntryAdvertisementsWidget} from './entry-advertisements/entry-advertisements-widget.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

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
		EntryPreviewWidget,
		EntryDistributionWidget,
		EntryAdvertisementsWidget
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
	public _kmcPermissions = KMCPermissions;

	public get _isSaveDisabled(): boolean {
    const editAccessControlAllowed = this._permissionsService.hasAnyPermissions([
      KMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
      KMCPermissions.CONTENT_MANAGE_RECONVERT,
      KMCPermissions.CONTENT_MANAGE_ENTRY_USERS,
      KMCPermissions.CONTENT_MANAGE_METADATA,
      KMCPermissions.CONTENT_MANAGE_SCHEDULE,
      KMCPermissions.CONTENT_MANAGE_THUMBNAIL,
      KMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
      KMCPermissions.CONTENT_MODERATE_METADATA,
      KMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
      KMCPermissions.LIVE_STREAM_UPDATE,
    ]);

		return !this._entryStore.entryIsDirty || !editAccessControlAllowed;
	}

	constructor(entryWidgetsManager: EntryWidgetsManager,
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
	            widget14: EntryDistributionWidget,
	            widget15: EntryAdvertisementsWidget,
	            private _permissionsService: KMCPermissionsService,
	            private _entriesStore: EntriesStore,
	            private _appLocalization: AppLocalization,
	            public _entryStore: EntryStore,
                private _contentEntryViewService: ContentEntryViewService,
                private _entryRoute: ActivatedRoute) {
		entryWidgetsManager.registerWidgets([
			widget1, widget2, widget3, widget4, widget5, widget6, widget7,
			widget8, widget9, widget10, widget11, widget12, widget13, widget14,
			widget15
		]);
	}

	ngOnDestroy() {
	}

	private _updateNavigationState() {
		const entries = this._entriesStore.entries.data();
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

	    this._entryStore.notifications$
            .pipe(cancelOnDestroy(this))
            .subscribe(
                ({ type, error }) => {
                    switch(type) {
                        case NotificationTypes.ViewEntered:
                            const { entry } = this._entryStore;

                            if (entry) {
                                this._contentEntryViewService.viewEntered({
                                    entry,
                                    activatedRoute: this._entryRoute,
                                    section: ContentEntryViewSections.ResolveFromActivatedRoute
                                });
                            }
                            break;
                        default:
                            break;
                    }
                });

		this._entryStore.state$
			.pipe(cancelOnDestroy(this))
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
							    const { entry } = this._entryStore;
								this._entryName = entry.name;
								this._entryType = entry.mediaType;
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

	public _backToList() {
		this._entryStore.returnToEntries();
	}

	public _save() {
		this._entryStore.saveEntry();
	}

	public _navigateToPrevious(): void {
		const entries = this._entriesStore.entries.data();

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex > 0) {
				const prevEntry = entries[currentEntryIndex - 1];
				this._entryStore.openEntry(prevEntry.id);
			}
		}
	}

	public _navigateToNext(): void {
		const entries = this._entriesStore.entries.data();

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex >= 0 && (currentEntryIndex < entries.length - 1)) {
				const nextEntry = entries[currentEntryIndex + 1];
				this._entryStore.openEntry(nextEntry.id);
			}
		}
	}

	public canLeave(): Observable<{ allowed: boolean }> {
		return this._entryStore.canLeave();
	}
}

