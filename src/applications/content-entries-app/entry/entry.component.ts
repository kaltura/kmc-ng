import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KalturaEntryStatus, KalturaExternalMediaEntry, KalturaMediaEntry, KalturaMediaType, KalturaPlaylist, KalturaSourceType } from 'kaltura-ngx-client';
import { ActionTypes, EntryStore, NotificationTypes } from './entry-store.service';
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
import { AreaBlockerMessage, AreaBlockerMessageButton, PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { EntriesStore } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntryDistributionWidget } from './entry-distribution/entry-distribution-widget.service';
import { EntryAdvertisementsWidget } from './entry-advertisements/entry-advertisements-widget.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { ClipAndTrimAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { CustomMenuItem } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { AppEventsService } from 'app-shared/kmc-shared';
import { ContentEntriesAppService } from '../content-entries-app.service';
import { AppAnalytics, ApplicationType, BrowserService } from 'app-shared/kmc-shell/providers';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AnalyticsNewMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { EntryQuizzeWidget } from './entry-quizzes/entry-quizzes-widget.service';
import { serverConfig } from 'config/server';
import { globalConfig } from 'config/global';
import { AppAuthentication, AppBootstrap } from 'app-shared/kmc-shell';
import {PubSubServiceType} from '@unisphere/runtime';

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
        EntryQuizzeWidget,
		EntryCaptionsWidget,
		EntryAccessControlWidget,
		EntryMetadataWidget,
		EntryDetailsWidget,
		EntryPreviewWidget,
		EntryDistributionWidget,
		EntryAdvertisementsWidget,
        KalturaLogger.createLogger('EntryComponent')
	]
})
export class EntryComponent implements OnInit, OnDestroy {
    @ViewChild('liveDashboard', { static: true }) _liveDashboard: PopupWidgetComponent;
    @ViewChild('clipAndTrim', { static: true }) _clipAndTrim: PopupWidgetComponent;
    @ViewChild('bulkActionsPopup', { static: true }) _bulkActionsPopup: PopupWidgetComponent;
	public _entryName: string;
	public _entryType: KalturaMediaType;
	public _sourceType: KalturaSourceType;
    public _entry: KalturaMediaEntry;
    public _contentLabEntryId: string;
    public _contentLabEventSessionContextId = '';
	public _showLoader = false;
	public _areaBlockerMessage: AreaBlockerMessage;
	public _currentEntryId: string;
	public _enablePrevButton: boolean;
	public _enableNextButton: boolean;
	public _entryHasChanges : boolean;
    public _isQuizEntry: boolean;
	public _kmcPermissions = KMCPermissions;
    public _contentLabAvailable = false;
    public _items: CustomMenuItem[] = [
        {
            label: this._appLocalization.get('applications.content.table.download'),
            commandName: 'download',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.previewAndEmbed'),
            commandName: 'preview',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.editor'),
            commandName: 'editor',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.pretest'),
            commandName: 'pretest',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.delete'),
            commandName: 'delete',
            styleClass: 'kDanger'
        }
    ];
    public _menuItems: CustomMenuItem[] = [];

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

    public _analyticsAllowed: boolean;
    public _contentLabSelectedQuiz: KalturaMediaEntry;

    private unisphereModuleContext: any;
    private unisphereCallbackUnsubscribe: Function;

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
                widget16: EntryQuizzeWidget,
	            private _permissionsService: KMCPermissionsService,
	            private _entriesStore: EntriesStore,
	            private _appLocalization: AppLocalization,
                private _analytics: AppAnalytics,
	            public _entryStore: EntryStore,
                private _contentEntryViewService: ContentEntryViewService,
                private _contentEntriesAppService: ContentEntriesAppService,
                private _clipAndTrimAppViewService: ClipAndTrimAppViewService,
                private _browserService: BrowserService,
                private _appEvents: AppEventsService,
                private _entryRoute: ActivatedRoute,
                private _logger: KalturaLogger,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _bootstrapService: AppBootstrap,
                private _appAuthentication: AppAuthentication,
                private _router: Router) {
		entryWidgetsManager.registerWidgets([
			widget1, widget2, widget3, widget4, widget5, widget6, widget7,
			widget8, widget9, widget10, widget11, widget12, widget13, widget14,
			widget15, widget16
		]);
	}

	ngOnDestroy() {
        if (this.unisphereCallbackUnsubscribe) {
            this.unisphereCallbackUnsubscribe();
            this.unisphereCallbackUnsubscribe = null;
        }
	}

    private _hideMenuItems(entry: KalturaMediaEntry,
                           { commandName }: { commandName: string }): boolean {
        const { sourceType, status, mediaType } = entry;
        const isReadyStatus = status === KalturaEntryStatus.ready;
        const isPreviewCommand = commandName === 'preview';
        const isKalturaLiveStream = (sourceType === KalturaSourceType.liveStream || sourceType === KalturaSourceType.manualLiveStream);
        const cannotDeleteEntry = commandName === 'delete' && !this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DELETE);
        const isDownloadCommand = commandName === 'download';
        const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
        const isNotVideoAudioImage = [KalturaMediaType.video, KalturaMediaType.audio, KalturaMediaType.image].indexOf(mediaType) === -1;
        const isPretestCommand = commandName === 'pretest';
        const isQuizEntry = entry.capabilities?.indexOf('quiz.quiz') > -1;
        return !(
            (!isReadyStatus && isPreviewCommand) || // hide if trying to share & embed entry that isn't ready
            (isDownloadCommand && (isNotVideoAudioImage || isExternalMedia)) ||
            cannotDeleteEntry || (isPretestCommand && !isQuizEntry)
        );
    }

    private _buildMenu(entry: KalturaMediaEntry): void {
        this._menuItems = this._items
            .filter(item => this._hideMenuItems(entry, item))
            .map(item => {
                switch (item.commandName) {
                    case 'preview':
                        item.disabled = entry.status === KalturaEntryStatus.noContent;
                        item.command = () => {
                            this._analytics.trackClickEvent('Share_Embed');
                            this._appEvents.publish(new PreviewAndEmbedEvent(entry));
                        }
                        break;
                    case 'editor':
                        item.disabled = !this._clipAndTrimAppViewService.isAvailable({
                            entry: entry,
                            hasSource: this._entryStore.hasSource.value()
                        });
                        item.command = () => {
                            this._contentLabSelectedQuiz = this._entryStore.entry;
                            this._clipAndTrim.open();
                        }
                        break;
                    case 'delete':
                        item.command = () => {
                            this._analytics.trackClickEvent('Delete');
                            this._browserService.confirm({
                                header: this._appLocalization.get('applications.content.entries.deleteEntry'),
                                message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', [entry.id]),
                                accept: () => this._deleteEntry(entry.id)
                            });
                        };
                        break;
                    case 'download':
                        this._analytics.trackClickEvent('Download');
                        item.command = () => this._downloadEntry(entry);
                        item.disabled = entry.status !== KalturaEntryStatus.ready || !this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DOWNLOAD);
                        break;
                    case 'pretest':
                        this._analytics.trackClickEvent('Pretest');
                        item.command = () => this._downloadPretest(entry.id);
                        break;
                    default:
                        break;
                }
                return item;
            });
    }

    private _downloadEntry(entry: KalturaMediaEntry, isContentLab = false): void {
	    if (!isContentLab && (entry.mediaType === KalturaMediaType.video || entry.mediaType === KalturaMediaType.audio)) {
            this._bulkActionsPopup.open();
        } else {
            const downloadUrl = entry.downloadUrl.indexOf('/ks/') === -1 ? `${entry.downloadUrl}/ks/${this._appAuthentication.appUser.ks}` : entry.downloadUrl;
            this._browserService.openLink(downloadUrl);
        }
    }

    private _deleteEntry(entryId: string): void {
        this._logger.info(`handle delete entry action by user`, { entryId });
        if (!entryId) {
            this._logger.info('EntryId is not defined. Abort action');
            return;
        }

        this._contentEntriesAppService.deleteEntry(entryId)
            .pipe(
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                () => {
                    this._backToList();
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        accept: () => {
                            this._entryStore.reloadEntry();
                        }
                    });
                }
            );
    }

    private _downloadPretest(entryId: string): void {
        if (!entryId) {
            this._logger.info('EntryId is not defined. Abort action');
            return;
        }

        this._contentEntriesAppService.downloadPretest(entryId)
            .pipe(
                tag('block-shell'),
                cancelOnDestroy(this)
            )
            .subscribe(
                (url) => {
                    this._browserService.openLink(url);
                },
                error => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        accept: () => {
                            this._entryStore.reloadEntry();
                        }
                    });
                }
            );
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
        this._contentLabAvailable = this._permissionsService.hasPermission(KMCPermissions.FEATURE_CONTENT_LAB);

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
                                this._contentLabSelectedQuiz = this._entryStore.entry;
								this._updateNavigationState();
								this._entryHasChanges = false;
								break;
							case ActionTypes.EntryLoaded:
							    const { entry } = this._entryStore;
								this._entryName = entry.name;
								this._entryType = entry.mediaType;
								this._sourceType = entry.sourceType;
                                this._isQuizEntry = entry.capabilities?.indexOf('quiz.quiz') > -1;
                                this._entry = entry;
                                const isLive = this.isLiveEntry(entry);
                                this._contentLabEntryId = isLive ? entry.redirectEntryId : entry.id;
                                this._contentLabEventSessionContextId = isLive ? entry.id : '';
                                this._analyticsAllowed = this._analyticsNewMainViewService.isAvailable(); // new analytics app is available
                                this._buildMenu(entry);
                                if (this._contentLabAvailable) {
                                    if (this.unisphereCallbackUnsubscribe) {
                                        this.unisphereCallbackUnsubscribe();
                                        this.unisphereCallbackUnsubscribe = null;
                                    }
                                    if (this.unisphereModuleContext) {
                                        this.unisphereModuleContext = null;
                                    }
                                }
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

    private isLiveEntry(entry: KalturaMediaEntry): boolean {
        return entry.mediaType === KalturaMediaType.liveStreamFlash ||
            entry.mediaType === KalturaMediaType.liveStreamWindowsMedia ||
            entry.mediaType === KalturaMediaType.liveStreamRealMedia ||
            entry.mediaType === KalturaMediaType.liveStreamQuicktime;
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

    public _openEntryAnalytics(): void {
        if (this._analyticsAllowed) {
            this._analytics.trackClickEvent('View_analytics');
            const isLive = this._sourceType === KalturaSourceType.liveStream || this._sourceType === KalturaSourceType.manualLiveStream || this._sourceType === KalturaSourceType.akamaiLive || this._sourceType === KalturaSourceType.akamaiUniversalLive;
            const isWebcast = this._entry.adminTags && this._entry.adminTags.indexOf('kms-webcast-event') !== -1;
            const route = isLive ? 'analytics/entry-webcast' : 'analytics/entry';
            this._router.navigate([route], { queryParams: { id: this._currentEntryId } });
        }
    }

    public loadCL(): void {
        this.unisphereModuleContext?.openWidget(); // open widget
    }
}

