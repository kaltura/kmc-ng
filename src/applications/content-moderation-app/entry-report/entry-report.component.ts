import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AreaBlockerMessage, PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {ModerationStore} from '../moderation-store/moderation-store.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {Router} from '@angular/router';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {BulkService} from '../bulk-service/bulk.service';
import {EntriesStore} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import {EntryReportSections} from './entry-report-sections';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {
    KalturaEntryStatus,
    KalturaMediaEntry,
    KalturaMediaType,
    KalturaModerationFlag,
    KalturaSourceType
} from 'kaltura-ngx-client';
import {Observer} from 'rxjs/Observer';
import {buildCDNUrl, serverConfig} from 'config/server';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {ContentEntryViewSections, ContentEntryViewService} from 'app-shared/kmc-shared/kmc-views/details-views';
import {EmbedConfig, EmbedParams, PreviewEmbedService} from "../../preview-and-embed/preview-and-embed.service";

export interface Tabs {
    name: string;
    isActive: boolean;
    disabled: boolean;
}

@Component({
    selector: 'kEntryReport',
    templateUrl: './entry-report.component.html',
    styleUrls: ['./entry-report.component.scss'],
    providers: [ModerationStore, PreviewEmbedService]
})

export class EntryReportComponent implements OnInit, OnDestroy {

    public _kmcPermissions = KMCPermissions;
    @ViewChild('previewIframe') previewIframe: ElementRef;
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() entryId: string;

    private _isRecordedLive = false;
    private _userId = '';

    public serverUri = buildCDNUrl("");
    public _areaBlockerMessage: AreaBlockerMessage = null;
    public _tabs: Tabs[] = [];
    public _flags: KalturaModerationFlag[] = null;
    public _entry: KalturaMediaEntry = null;
    public _hasDuration = false;
    public _isEntryReady = false;
    public _isClip = false;
    public _flagsAmount = '';
    public EntryReportSections = EntryReportSections;
    public _isBusy = false;
    public _isEntryLinkAvailable = false;
    public _isImage = false;
    public _showPlayer = true;
    private renderPlayer = null;
    public _generatedPreviewCode: string | EmbedParams = "";
    public _loadThumbnailWithKs = false;
    public _thumbnailUrl = '';
    public _ks = '';

    constructor(public _moderationStore: ModerationStore,
                private _appLocalization: AppLocalization,
                private _router: Router,
                private _previewEmbedService: PreviewEmbedService,
                private _browserService: BrowserService,
                private _bulkService: BulkService,
                private _appAuthentication: AppAuthentication,
                private _contentEntryViewService: ContentEntryViewService,
                private _permissionsService: KMCPermissionsService,
                private _entriesStore: EntriesStore) {
    }

    ngOnInit() {
        this._showPlayer = false; // remove iframe from DOM to invoke refresh
        this._loadThumbnailWithKs = this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
        this._ks = this._appAuthentication.appUser.ks;
        this._loadEntryModerationDetails();
        this.renderPlayer = (e) => {
            if (!e.data) {
                return;
            }
            if (e.origin === window.location.origin && e.data.messageType === 'init') {
                this.previewIframe.nativeElement.contentWindow.postMessage({
                    'messageType': 'embed',
                    embedParams: this._generatedPreviewCode
                }, window.location.origin);
            }
            if (e.origin === window.location.origin && e.data.messageType === 'currentTime') {
                // pass current position
                const context = {
                    currentPosition: e.data.currentTime
                };
                this.parentPopupWidget.close(context);
            }
        }
    }

    ngOnDestroy() {
        window.removeEventListener('message', this.renderPlayer);
    }

    private showPreview() {
        setTimeout(() => { // use a timeout to allow the iframe to render before accessing its native element
            window.addEventListener('message', this.renderPlayer);
            const uri = serverConfig.externalApps.playerWrapper ? serverConfig.externalApps.playerWrapper.uri : '/public/playerWrapper.html';
            this.previewIframe.nativeElement.src = uri;
            this._generatedPreviewCode = this.generateV3code();
        }, 0);
    }

    private generateV3code(): string | EmbedParams {
        const uiConfId = serverConfig.kalturaServer.previewUIConfV7.toString();
        const embedType = 'dynamic';
        const ks = this._appAuthentication.appUser.ks;
        let embedConfig: EmbedConfig = {
            embedType,
            ks,
            entryId: this.entryId,
            uiConfId,
            width: '340px',
            height: '210px',
            pid: this._appAuthentication.appUser.partnerId,
            serverUri: buildCDNUrl(''),
            playerConfig: ''
        }
        let config = '';
        let poster = '';
        config = `{"ks": "${ks}"}`;
        // force thumbnail download using ks if needed
        if (this._loadThumbnailWithKs) {
            poster = `${this._entry.thumbnailUrl}/width/340/ks/${this._appAuthentication.appUser.ks}`;
        }
        embedConfig.playerConfig = config;
        return this._previewEmbedService.generateV3EmbedCode(embedConfig, true, poster);
    }


    private _getObserver(retryFn: () => void): Observer<any> {
        return {
            next: () => {
                this._closePopup();
                this._entriesStore.reload();
                this._areaBlockerMessage = null;
            },
            error: (error) => {
                this._areaBlockerMessage = new AreaBlockerMessage({
                    message: error.message,
                    buttons: [
                        {
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._areaBlockerMessage = null;
                                retryFn();
                            }
                        },
                        {
                            label: this._appLocalization.get('app.common.cancel'),
                            action: () => {
                                this._areaBlockerMessage = null;
                            }
                        }
                    ]
                });
            },
            complete: () => {
                // empty by design
            }
        };
    }

    private _doApproveEntry(): void {
        const retryFn = () => this._doApproveEntry();
        this._areaBlockerMessage = null;
        this._bulkService.approveEntry([this._entry.id])
            .pipe(cancelOnDestroy(this))
            .pipe(tag('block-shell'))
            .subscribe(this._getObserver(retryFn));
    }

    private _doRejectEntry(): void {
        const retryFn = () => this._doRejectEntry();
        this._areaBlockerMessage = null;
        this._bulkService.rejectEntry([this._entry.id])
            .pipe(cancelOnDestroy(this))
            .pipe(tag('block-shell'))
            .subscribe(this._getObserver(retryFn));
    }

    private _loadEntryModerationDetails(): void {
        this._isBusy = true;
        this._tabs = [
            {
                name: this._appLocalization.get('applications.content.moderation.report'),
                isActive: false,
                disabled: false
            },
            {
                name: this._appLocalization.get('applications.content.moderation.details'),
                isActive: false,
                disabled: false
            }
        ];
        this._moderationStore.loadEntryModerationDetails(this.entryId)
            .pipe(cancelOnDestroy(this))
            .subscribe(
                response => {
                    this._isBusy = false;
                    this._areaBlockerMessage = null;
                    if (response.entry && response.flag) {
                        this._entry = response.entry;
                        this._isImage = this._entry.mediaType === KalturaMediaType.image;
                        this._thumbnailUrl = this._entry.thumbnailUrl + '/width/340';
                        this._showPlayer = !this._isImage;
                        if (this._showPlayer) {
                            this.showPreview();
                        }
                        this._isEntryLinkAvailable = this._contentEntryViewService.isAvailable({
                            entry: this._entry,
                            section: ContentEntryViewSections.Metadata
                        });
                        this._flags = response.flag.objects;
                        const moderationCount = this._entry.moderationCount;
                        this._flagsAmount = moderationCount === 1
                            ? this._appLocalization.get('applications.content.moderation.flagSingular', {0: moderationCount})
                            : this._appLocalization.get('applications.content.moderation.flagPlural', {0: moderationCount});
                        this._userId = this._entry.userId;

                        if (this._entry.moderationCount > 0) {
                            this._tabs[EntryReportSections.Report].isActive = true;
                        } else {
                            this._tabs[EntryReportSections.Details].isActive = true;
                            this._tabs[EntryReportSections.Report].disabled = true;
                        }

                        if (this._entry.sourceType) {
                            const sourceType = this._entry.sourceType.toString();
                            const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
                                sourceType === KalturaSourceType.akamaiLive.toString() ||
                                sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
                                sourceType === KalturaSourceType.manualLiveStream.toString());
                            this._hasDuration = this._entry.status !== KalturaEntryStatus.noContent
                                && !isLive
                                && this._entry.mediaType.toString() !== KalturaMediaType.image.toString();
                            this._isEntryReady = this._entry.status.toString() === KalturaEntryStatus.ready.toString();
                            this._isRecordedLive = (sourceType === KalturaSourceType.recordedLive.toString());
                            this._isClip = !this._isRecordedLive && (this._entry.id !== this._entry.rootEntryId);
                        }
                     }
                },
                error => {
                    this._isBusy = false;
                    this._areaBlockerMessage = new AreaBlockerMessage({
                        message: error.message,
                        buttons: [
                            {
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._areaBlockerMessage = null;
                                    this._loadEntryModerationDetails();
                                }
                            },
                            {
                                label: this._appLocalization.get('app.common.cancel'),
                                action: () => {
                                    this._closePopup();
                                    this._areaBlockerMessage = null;
                                }
                            }
                        ]
                    });
                }
            );
    }

    public _closePopup(): void {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
        }
    }

    public _changeTab(index: number): void {
        if (!this._tabs[index].disabled) {
            this._tabs.forEach(tab => tab.isActive = false);
            this._tabs[index].isActive = true;
        }
    }

    public _navigateToEntry(entryId): void {
        this._contentEntryViewService.openById(entryId, ContentEntryViewSections.Metadata);
    }

    public _banCreator(): void {
        this._moderationStore.banCreator(this._userId)
            .pipe(cancelOnDestroy(this))
            .pipe(tag('block-shell'))
            .subscribe(
                () => {
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.attention'),
                        message: this._appLocalization.get('applications.content.moderation.notificationHasBeenSent')
                    });
                },
                error => {
                    this._areaBlockerMessage = new AreaBlockerMessage({
                        message: error.message,
                        buttons: [
                            {
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._areaBlockerMessage = null;
                                    this._banCreator();
                                }
                            },
                            {
                                label: this._appLocalization.get('app.common.cancel'),
                                action: () => {
                                    this._areaBlockerMessage = null;
                                }
                            }
                        ]
                    });
                }
            );
    }

    public _approveEntry(): void {
        if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_KMC_VERIFY_MODERATION)) {
            this._browserService.confirm({
                header: this._appLocalization.get('applications.content.moderation.approveMedia'),
                message: this._appLocalization.get('applications.content.moderation.sureToApprove', {0: this._entry.name}),
                accept: () => this._doApproveEntry()
            });
        } else {
            this._doApproveEntry();
        }
    }

    public _rejectEntry(): void {
        if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_KMC_VERIFY_MODERATION)) {
            this._browserService.confirm({
                header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
                message: this._appLocalization.get('applications.content.moderation.sureToReject', {0: this._entry.name}),
                accept: () => this._doRejectEntry()
            });
        } else {
            this._doRejectEntry();
        }
    }

    public _onThumbLoadError(event): void {
        event.target.style.display = 'none';
    }
}
