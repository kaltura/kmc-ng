import {Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {
    KalturaClient,
    KalturaEntryStatus,
    KalturaMediaEntry,
    KalturaMediaType,
    KalturaPlaylist,
    KalturaQuizOutputType,
    QuizGetUrlAction
} from 'kaltura-ngx-client';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {AppAuthentication, AppBootstrap, ApplicationType, BrowserService} from 'app-shared/kmc-shell';
import {PreviewAndEmbedEvent} from 'app-shared/kmc-shared/events';
import {ISubscription} from 'rxjs/Subscription';
import {PubSubServiceType, UnisphereElementBaseType} from '@unisphere/runtime';
import {Router} from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import {AppEventsService} from 'app-shared/kmc-shared';

import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {Observable} from 'rxjs';
import {throwError as ObservableThrowError} from 'rxjs/internal/observable/throwError';

@Component({
    selector: 'k-content-lab-btn',
    templateUrl: './content-lab-button.component.html',
    styleUrls: ['./content-lab-button.component.scss'],
    providers: [KalturaLogger.createLogger('ContentLabButtonComponent')]
})
export class ContentLabBtnComponent implements OnDestroy {
    @Input() set entryId(value: string) {
        this._entryId = value;
        this.initializeUnisphereRuntime();
    };

    @Input() entryDuration: number;
    @Input() entryStatus: KalturaEntryStatus;
    @Input() entryType: number;
    @Input() eventSessionContextId: string;
    @Input() responsive: boolean;
    @Input() entryStore: any;

    @Output() onAction = new EventEmitter<string>();

    @ViewChild('clipAndTrim', { static: true }) _clipAndTrim: PopupWidgetComponent;
    @ViewChild('bulkActionsPopup', { static: true }) _bulkActionsPopup: PopupWidgetComponent;

    private unisphereCallbackUnsubscribe: ISubscription;
    private unisphereRuntime: any = null;
    private _unsubscribePartnerCheck: () => void;
    private _destroyed = false;

    public _contentLabSelectedQuiz: KalturaMediaEntry;
    public loading = true;
    public disabled = true;
    public reason = '';
    public _entryId: string;


    constructor(private _bootstrapService: AppBootstrap,
                private _router: Router,
                private cdr: ChangeDetectorRef,
                private _kalturaServerClient: KalturaClient,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _appAuthentication: AppAuthentication) {
    }

    private initializeUnisphereRuntime() {
        this._bootstrapService.unisphereWorkspace$
            .pipe(cancelOnDestroy(this))
            .subscribe(unisphereWorkspace => {

                    if (unisphereWorkspace) {

                        this.unisphereRuntime = unisphereWorkspace.getRuntime('unisphere.widget.content-lab', 'application');

                        if (this.unisphereRuntime) {
                            this._unsubscribePartnerCheck = this.unisphereRuntime.partnerChecks.onChanges((data) => {
                                if (data.status === 'loaded') {
                                    if (data.isAvailable && data.hasConsent) {
                                        const entry = {
                                            id: this._entryId,
                                            type: this.entryType,
                                            duration: this.entryDuration,
                                            status: this.entryStatus
                                        }
                                        this.unisphereRuntime.isEntryRelevant(entry).then(
                                            result => {
                                                if (this._destroyed) return;
                                                this.loading = false;
                                                this.disabled = !result.canUse;
                                                this.reason = result.rejectionReason;
                                                this.cdr.detectChanges();
                                            },
                                            error => {
                                                if (this._destroyed) return;
                                                this.loading = false;
                                                this.disabled = true;
                                                this.reason = 'error';
                                            }
                                        )
                                    } else {
                                        this.loading = false;
                                        this.disabled = false; // TODO - mark button with missing AI consent? @Dana
                                        this.cdr.detectChanges();
                                        // if (!data.hasConsent) {
                                        //     this.reason = 'AI_CONSENT'; // TODO: enable button to open AI consent announcement?
                                        // } else {
                                        //     this.reason = data.unavailabilityReason;
                                        // }
                                    }
                                } else if (data.status === 'error') {
                                    this.loading = false;
                                    this.disabled = true;
                                    this.reason = data.error;
                                    this.cdr.detectChanges();
                                    console.error('Error loading partner checks', data.error);
                                }
                            }, {replayLastValue: true})

                        }

                        unisphereWorkspace.getService<PubSubServiceType>('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.content-lab.message-host-app', (data) => {
                            const { action, entry } = data.payload;
                            if (entry.id === this._entryId) {
                                switch (action) {
                                    case 'entry':
                                        // navigate to entry
                                        this.unisphereRuntime?.closeWidget(); // close widget
                                        document.body.style.overflowY = "auto";
                                        if (this.entryStore) {
                                            this.entryStore.openEntry(new KalturaMediaEntry(entry));
                                        } else {
                                            this._router.navigateByUrl(`/content/entries/entry/${entry.id}/metadata`);
                                        }
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
                                        const downloadUrl = entry.downloadUrl.indexOf('/ks/') === -1 ? `${entry.downloadUrl}/ks/${this._appAuthentication.appUser.ks}` : entry.downloadUrl;
                                        this._browserService.openLink(downloadUrl);
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
                                        // this._clipAndTrim.open();
                                        this.onAction.emit('editQuiz');
                                        break;
                                    case 'downloadQuiz':
                                        // download questions list
                                        this._downloadPretest(entry.id)
                                        break;
                                    case 'updateMetadata':
                                        // update metadata
                                        // this._entryStore.reloadEntry(); TODO: send action
                                        break;
                                    default:
                                        break;
                                }
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

    public openContentLab(): void {
        if (this.unisphereRuntime) {
            this.unisphereRuntime.openApplication({entryId: this._entryId, eventSessionContextId: this.eventSessionContextId, type: 'entry'});
        }
    }

    private downloadPretest(entryId: string): Observable<string> {
        if (!entryId) {
            return ObservableThrowError('missing entryId argument');
        }
        return this._kalturaServerClient
            .request(new QuizGetUrlAction({ entryId, quizOutputType: KalturaQuizOutputType.pdf }))
    }

    private _downloadPretest(entryId: string): void {
        if (!entryId) {
            this._logger.info('EntryId is not defined. Abort action');
            return;
        }
        this.downloadPretest(entryId)
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
                        message: error.message
                    });
                }
            );
    }
}
