import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KalturaEntryStatus, KalturaLiveStreamEntry, KalturaMediaEntry, KalturaMediaType, KalturaPlaylist} from 'kaltura-ngx-client';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {AppAuthentication, AppBootstrap, ApplicationType, BrowserService} from 'app-shared/kmc-shell';
import {serverConfig} from 'config/server';
import {globalConfig} from 'config/global';
import {PreviewAndEmbedEvent} from 'app-shared/kmc-shared/events';
import {ISubscription} from 'rxjs/Subscription';
import {PubSubServiceType, UnisphereElementBaseType} from '@unisphere/runtime';
import {Router} from '@angular/router';
import {AppEventsService} from 'app-shared/kmc-shared';
import {EntryStore} from '../../entry-store.service';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {ContentEntriesAppService} from '../../../content-entries-app.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Component({
    selector: 'k-content-lab-btn',
    templateUrl: './content-lab-button.component.html',
    styleUrls: ['./content-lab-button.component.scss'],
    providers: [KalturaLogger.createLogger('ContentLabButtonComponent')]
})
export class ContentLabButtonComponent implements OnInit, OnDestroy {
    @Input() entryId: string;
    @Input() entryDuration: number;
    @Input() entryStatus: KalturaEntryStatus;
    @Input() entryType: number;
    @Input() eventSessionContextId: string;
    @ViewChild('clipAndTrim', { static: true }) _clipAndTrim: PopupWidgetComponent;
    @ViewChild('bulkActionsPopup', { static: true }) _bulkActionsPopup: PopupWidgetComponent;

    private unisphereCallbackUnsubscribe: ISubscription;
    private unisphereRuntime: any = null;
    private _unsubscribePartnerCheck: () => void;
    private _destroyed = false;

    public _contentLabSelectedQuiz: KalturaMediaEntry;
    public _isQuizEntry: boolean;
    public loading = true;
    public disabled = true;
    public reason = '';


    constructor(private _bootstrapService: AppBootstrap,
                private _router: Router,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _contentEntriesAppService: ContentEntriesAppService,
                public _entryStore: EntryStore,
                private _appAuthentication: AppAuthentication) {
    }

    ngOnInit() {
        this._bootstrapService.unisphereWorkspace$
            .pipe(cancelOnDestroy(this))
            .subscribe(unisphereWorkspace => {

                    if (unisphereWorkspace) {

                        this.unisphereRuntime = unisphereWorkspace.getRuntime('unisphere.widget.content-lab', 'application');

                        if (this.unisphereRuntime) {
                            this._unsubscribePartnerCheck = this.unisphereRuntime.partnerChecks.onChanges((data) => {
                                if (data.status === 'loaded') {
                                    if (data.isAvailable) {
                                        const entry = {
                                            id: this.entryId,
                                            type: this.entryType,
                                            duration: this.entryDuration,
                                            status: this.entryStatus
                                        }
                                        this.unisphereRuntime.isEntryRelevant(entry, { canManageCaptions: false}).then(
                                            result => {
                                                if (this._destroyed) return;
                                                this.loading = false;
                                                this.disabled = !result.canUse;
                                            },
                                            error => {
                                                if (this._destroyed) return;
                                                this.loading = false;
                                                this.disabled = true;
                                                this.reason = 'error'; // TODO - add error message token
                                            }
                                        )
                                    } else {
                                        this.loading = false;
                                        this.disabled = true;
                                        this.reason = data.unavailabilityReason;
                                    }
                                } else if (data.status === 'error') {
                                    this.loading = false;
                                    this.disabled = true;
                                    this.reason = 'general error'; // TODO - add error message
                                    console.error('Error loading partner checks', data.error);
                                }
                            }, {replayLastValue: true})

                        }

                        unisphereWorkspace.getService<PubSubServiceType>('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.content-lab.message-host-app', (data) => {
                            const { action, entry } = data.payload;

                            switch (action) {
                                case 'entry':
                                    // navigate to entry
                                    this.unisphereRuntime?.closeWidget(); // close widget
                                    document.body.style.overflowY = "auto";
                                    this._entryStore.openEntry(new KalturaMediaEntry(entry));
                                    break;
                                case 'playlist':
                                    // navigate to playlist metadata tab
                                    this.unisphereRuntime?.closeWidget(); // close widget
                                    document.body.style.overflowY = "auto";
                                    this._router.navigateByUrl(`/content/playlists/playlist/${entry.id}/metadata`);
                                    break;
                                case 'editPlaylist':
                                    // navigate to playlist content tb
                                    this.unisphereRuntime?.closeWidget(); // close widget
                                    document.body.style.overflowY = "auto";
                                    this._router.navigateByUrl(`/content/playlists/playlist/${entry.id}/content`);
                                    break;
                                case 'download':
                                    // download entry
                                    this._downloadEntry(entry, true);
                                    break;
                                case 'share':
                                    // open share & embed for entry
                                    this.unisphereRuntime?.closeWidget(); // close widget
                                    document.body.style.overflowY = "auto";
                                    this._appEvents.publish(new PreviewAndEmbedEvent(new KalturaMediaEntry(entry)));
                                    break;
                                case 'sharePlaylist':
                                    // open share & embed for playlist
                                    this.unisphereRuntime?.closeWidget(); // close widget
                                    document.body.style.overflowY = "auto";
                                    this._appEvents.publish(new PreviewAndEmbedEvent(new KalturaPlaylist(entry)));
                                    break;
                                case 'editQuiz':
                                    // edit entry
                                    this._contentLabSelectedQuiz = new KalturaMediaEntry(entry);
                                    this.unisphereRuntime?.closeWidget();
                                    document.body.style.overflowY = "auto";
                                    this._isQuizEntry = true;
                                    this._clipAndTrim.open();
                                    break;
                                case 'downloadQuiz':
                                    // download questions list
                                    this._downloadPretest(entry.id)
                                    break;
                                case 'updateMetadata':
                                    // update metadata
                                    this._entryStore.reloadEntry();
                                    break;
                                default:
                                    break;
                            }
                        })
                    }
                },
                error => {
                    // TODO - handle unisphere workspace load error
                })
    }

    ngOnDestroy() {
        if (this._unsubscribePartnerCheck) {
            this._unsubscribePartnerCheck();
            this._unsubscribePartnerCheck = null;
        }
        this._destroyed = true;
    }

    private _downloadEntry(entry: KalturaMediaEntry, isContentLab = false): void {
        if (!isContentLab && (entry.mediaType === KalturaMediaType.video || entry.mediaType === KalturaMediaType.audio)) {
            this._bulkActionsPopup.open();
        } else {
            const downloadUrl = entry.downloadUrl.indexOf('/ks/') === -1 ? `${entry.downloadUrl}/ks/${this._appAuthentication.appUser.ks}` : entry.downloadUrl;
            this._browserService.openLink(downloadUrl);
        }
    }

    public openContentLab(): void {
        if (this.unisphereRuntime) {
            this.unisphereRuntime.openWidget(this.entryId, this.eventSessionContextId);
            document.body.style.overflowY = "hidden";
        }
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
}
