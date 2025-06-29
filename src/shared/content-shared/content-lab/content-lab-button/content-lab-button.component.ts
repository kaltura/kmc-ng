import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {KalturaLiveStreamAdminEntry, KalturaMediaEntry, KalturaMediaType} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AppAnalytics, AppBootstrap, ButtonType} from 'app-shared/kmc-shell';
import {ChangeDetectorRef} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'k-content-lab-btn',
    templateUrl: './content-lab-button.component.html',
    styleUrls: ['./content-lab-button.component.scss'],
    providers: [KalturaLogger.createLogger('ContentLabBtnComponent')]
})
export class ContentLabBtnComponent implements OnDestroy {
    @Input() set entry(value: KalturaMediaEntry) {
        this._entry = value;
        this.initializeUnisphereRuntime();
    };
    @Input() responsive: boolean;
    @Output() onOpenContentLab = new EventEmitter<void>();

    private unisphereRuntime: any = null;
    private _unsubscribePartnerCheck: () => void;
    private _destroyed = false;

    public loading = true;
    public disabled = true;
    public reason = '';
    public _entry: KalturaMediaEntry;

    constructor(private _bootstrapService: AppBootstrap, private cdr: ChangeDetectorRef, private _analytics: AppAnalytics) {
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
                                    if (data.isAvailable) {
                                        this.unisphereRuntime.isEntryRelevant(this._entry).then(
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
                                                this.reason = 'GENERAL_ERROR';
                                                this.cdr.detectChanges(); // force refresh as change was made outside Angular ngZone
                                            }
                                        )
                                    } else {
                                        this.loading = false;
                                        this.disabled = true;
                                        this.reason = 'NO_CATALOG_ITEMS';
                                        this.cdr.detectChanges(); // force refresh as change was made outside Angular ngZone
                                    }
                                } else if (data.status === 'error') {
                                    this.loading = false;
                                    this.disabled = true;
                                    this.reason = data.error;
                                    this.cdr.detectChanges(); // force refresh as change was made outside Angular ngZone
                                    console.error('Error loading partner checks', data.error);
                                }
                            }, {replayLastValue: true})

                        }
                    }
                },
                error => {
                    console.error('Error initializing Unisphere workspace', error);
                })
    }

    ngOnDestroy() {
        if (this._unsubscribePartnerCheck) {
            this._unsubscribePartnerCheck();
            this._unsubscribePartnerCheck = null;
        }
        this._destroyed = true;
    }

    private isLiveEntry(entry: KalturaMediaEntry): boolean {
        return entry.mediaType === KalturaMediaType.liveStreamFlash ||
            entry.mediaType === KalturaMediaType.liveStreamWindowsMedia ||
            entry.mediaType === KalturaMediaType.liveStreamRealMedia ||
            entry.mediaType === KalturaMediaType.liveStreamQuicktime;
    }

    public openContentLab(): void {
        if (this.unisphereRuntime) {
            this._analytics.trackButtonClickEvent(ButtonType.Open,'CreateWithAI', this.responsive ? 'KMC_Entries_list page' : 'KMC_entry_page', 'CL_core');
            if (this.isLiveEntry(this._entry) && (this._entry.redirectEntryId || (this._entry as KalturaLiveStreamAdminEntry).recordedEntryId)) {
                const recordingEntryId = (this._entry as KalturaLiveStreamAdminEntry).recordedEntryId || this._entry.redirectEntryId;
                this.unisphereRuntime.openApplication({entryId: recordingEntryId, eventSessionContextId: this._entry.id, type: 'entry'});
            } else {
                this.unisphereRuntime.openApplication({entryId: this._entry.id, eventSessionContextId: '', type: 'entry'});
            }
            this.onOpenContentLab.emit();
        }
    }

}
