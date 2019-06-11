import { Injectable, OnDestroy } from '@angular/core';
import {
    KalturaClient,
    KalturaEntryServerNode,
    KalturaEntryServerNodeListResponse,
    KalturaEntryServerNodeStatus,
    KalturaEntryServerNodeType,
    KalturaLiveStreamEntry,
    KalturaRecordingStatus,
    KalturaViewMode,
    LiveStreamUpdateAction
} from 'kaltura-ngx-client';
import { LiveDataRequestFactory } from './live-data-request-factory';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { map } from 'rxjs/operators';
import { KmcServerPolls } from 'app-shared/kmc-shared';
import { BehaviorSubject } from 'rxjs';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';


export interface KalturaExtendedLiveEntry extends KalturaLiveStreamEntry {
    redundancy: boolean;
    streamStatus: KalturaStreamStatus;
    serverType: KalturaEntryServerNodeType;
}

export enum KalturaStreamStatus {
    live = 'Live',
    initializing = 'Initializing',
    offline = 'Offline',
    preview = 'Preview'
}

@Injectable()
export class ToggleLiveService implements OnDestroy {
    private _isPolling = false;
    private _entry: KalturaExtendedLiveEntry;
    private _canToggle = new BehaviorSubject<boolean>(true);
    private _isPreview = new BehaviorSubject<boolean>(false);

    public readonly canToggle$ = this._canToggle.asObservable();
    public readonly isPreview$ = this._isPreview.asObservable();

    constructor(private _kmcServerPolls: KmcServerPolls,
                private _browserService: BrowserService,
                private _kalturaClient: KalturaClient,
                private _appLocalization: AppLocalization) {
    }

    ngOnDestroy(): void {
        this._canToggle.complete();
        this._isPreview.complete();
    }

    private _getStreamStatus(entryServerNodeStatus: KalturaEntryServerNodeStatus,
                             viewMode = KalturaViewMode.allowAll): KalturaStreamStatus {
        switch (entryServerNodeStatus) {
            case KalturaEntryServerNodeStatus.authenticated:
            case KalturaEntryServerNodeStatus.broadcasting:
                return KalturaStreamStatus.initializing;

            case KalturaEntryServerNodeStatus.playable:
                return (viewMode === KalturaViewMode.preview) ? KalturaStreamStatus.preview : KalturaStreamStatus.live;

            case KalturaEntryServerNodeStatus.stopped:
            default:
                return KalturaStreamStatus.offline;
        }
    }

    private _getRedundancyStatus(serverNodeList: KalturaEntryServerNode[]): boolean {
        if (serverNodeList.length > 1) {
            return serverNodeList.every(sn => sn.status !== KalturaEntryServerNodeStatus.markedForDeletion);
        }
        return false;
    }

    // Possible scenarios for streamStatus:
    // (1) If only primary -> StreamStatus equals primary status
    // (2) If only secondary -> StreamStatus equals secondary status
    // (3) If both -> StreamStatus equals the same as recent active
    private _setStreamStatus(liveEntry: KalturaExtendedLiveEntry, serverNodeList: KalturaEntryServerNode[]): void {
        const viewMode = liveEntry.explicitLive ? liveEntry.viewMode : null;
        let result: { status: KalturaStreamStatus, serverType: KalturaEntryServerNodeType } = {
            status: this._getStreamStatus(KalturaEntryServerNodeStatus.stopped),
            serverType: null,
        };

        if (liveEntry.redundancy) {
            if (!liveEntry.serverType || (KalturaEntryServerNodeType.livePrimary === liveEntry.serverType)) {
                result = {
                    status: this._getStreamStatus(serverNodeList[0].status, viewMode),
                    serverType: KalturaEntryServerNodeType.livePrimary,
                };
            } else if (KalturaEntryServerNodeType.liveBackup === liveEntry.serverType) {
                result = {
                    status: this._getStreamStatus(serverNodeList[1].status, viewMode),
                    serverType: KalturaEntryServerNodeType.liveBackup,
                };
            }
        } else {
            if (serverNodeList.length) {
                const sn = serverNodeList.find(esn => esn.status !== KalturaEntryServerNodeStatus.markedForDeletion);
                if (sn) {
                    result = {
                        status: this._getStreamStatus(sn.status, viewMode),
                        serverType: sn.serverType,
                    };
                }
            }
        }

        liveEntry.streamStatus = result.status;
        liveEntry.serverType = result.serverType;
    }

    private _extendEntry(entry: KalturaExtendedLiveEntry, nodes: KalturaEntryServerNode[]): void {
        const liveEntry = Object.assign(entry, {
            redundancy: this._getRedundancyStatus(nodes),
            streamStatus: entry.streamStatus || KalturaStreamStatus.offline,
            serverType: entry.serverType || null,
        });
        this._setStreamStatus(liveEntry, nodes);
    }

    private _updateIsPreview(entry: KalturaLiveStreamEntry): void {
        this._isPreview.next(entry.viewMode === KalturaViewMode.preview);
    }

    private _updatePreviewMode(viewMode: KalturaViewMode, recordingStatus: KalturaRecordingStatus): void {
        this._canToggle.next(false);

        this._kalturaClient.request(
            new LiveStreamUpdateAction({
                entryId: this._entry.id,
                liveStreamEntry: new KalturaLiveStreamEntry({ viewMode, recordingStatus })
            })
        )
            .subscribe(
                (entry: KalturaLiveStreamEntry) => {
                    this._entry.viewMode = entry.viewMode;
                    this._entry.recordingStatus = entry.recordingStatus;

                    this._updateIsPreview(entry);

                    this._canToggle.next(true);
                },
                error => {
                    this._browserService.alert({ message: error.message });

                    this._canToggle.next(true);
                });
    }

    public startPolling(entry: KalturaLiveStreamEntry): void {
        if (entry && !this._isPolling) {
            this._isPolling = true;
            this._entry = entry as KalturaExtendedLiveEntry;

            this._updateIsPreview(entry);

            this._kmcServerPolls.register<KalturaEntryServerNodeListResponse>(10, new LiveDataRequestFactory(entry.id))
                .pipe(
                    cancelOnDestroy(this),
                    map(response => response.result ? response.result.objects : [])
                )
                .subscribe(nodes => {
                    this._extendEntry(this._entry, nodes);

                    const isBroadcasting = [KalturaStreamStatus.live, KalturaStreamStatus.preview].indexOf(this._entry.streamStatus) !== -1;
                    this._canToggle.next(isBroadcasting);
                });
        }
    }

    public toggle() {
        if (this._entry.viewMode === KalturaViewMode.preview) {
            this._updatePreviewMode(KalturaViewMode.allowAll, KalturaRecordingStatus.active);
        } else {
            this._browserService.confirm(
                {
                    header: this._appLocalization.get('applications.content.entryDetails.live.endLiveHeader'),
                    message: this._appLocalization.get('applications.content.entryDetails.live.endLiveMessage'),
                    acceptLabel: this._appLocalization.get('applications.content.entryDetails.live.endLive'),
                    accept: () => {
                        this._updatePreviewMode(KalturaViewMode.preview, KalturaRecordingStatus.stopped);
                    }
                });
        }
    }
}
