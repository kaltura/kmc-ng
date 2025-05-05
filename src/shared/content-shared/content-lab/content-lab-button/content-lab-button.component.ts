import {Component, Input, OnDestroy} from '@angular/core';
import {KalturaEntryStatus, KalturaMediaEntry} from 'kaltura-ngx-client';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {AppAnalytics, AppBootstrap, ButtonType} from 'app-shared/kmc-shell';
import { ChangeDetectorRef } from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'k-content-lab-btn',
    templateUrl: './content-lab-button.component.html',
    styleUrls: ['./content-lab-button.component.scss'],
    providers: [KalturaLogger.createLogger('ContentLabBtnComponent')]
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

    private unisphereRuntime: any = null;
    private _unsubscribePartnerCheck: () => void;
    private _destroyed = false;

    public _contentLabSelectedQuiz: KalturaMediaEntry;
    public loading = true;
    public disabled = true;
    public reason = '';
    public _entryId: string;

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
                                                this.cdr.detectChanges();
                                            }
                                        )
                                    } else {
                                        this.loading = false;
                                        this.disabled = true;
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
            this._analytics.trackButtonClickEvent(ButtonType.Open,'GenerateWithAI', 'none', 'CL_core');
            this.unisphereRuntime.openApplication({entryId: this._entryId, eventSessionContextId: this.eventSessionContextId, type: 'entry'});
        }
    }

}
