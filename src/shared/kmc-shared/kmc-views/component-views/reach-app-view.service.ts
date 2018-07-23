import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import {
    KalturaCategory,
    KalturaClient,
    KalturaEntryStatus,
    KalturaExternalMediaEntry,
    KalturaMediaEntry,
    KalturaMediaType
} from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { KmcComponentViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-component-view-base.service';
import { serverConfig } from 'config/server';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

export enum ReachPages {
    entry = 'entry',
    entries = 'entries',
    category = 'category'
}

export interface ReachAppViewArgs {
    entry?: KalturaMediaEntry;
    entries?: KalturaMediaEntry[];
    category?: KalturaCategory;
    page: ReachPages;
}

@Injectable()
export class ReachAppViewService extends KmcComponentViewBaseService<ReachAppViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('ReachAppViewService'));
    }

    private _availableByPermission(): boolean {
        return this._appPermissions.hasPermission(KMCPermissions.REACH_PLUGIN_PERMISSION);
    }

    private _availableByData(args: ReachAppViewArgs): boolean {
        switch (args.page) {
            case ReachPages.entry:
                return this.isRelevantEntry(args.entry);
            case ReachPages.entries:
                return true; // since we build bulk actions menu before entries are selected, always allow by data
            case ReachPages.category:
                return args.category instanceof KalturaCategory;
            default:
                return false;
        }
    }

    public isRelevantEntry(entry: KalturaMediaEntry): boolean {
        if (entry) {
            const isVideoAudio = entry.mediaType === KalturaMediaType.video || entry.mediaType === KalturaMediaType.audio;
            const isReady = entry.status === KalturaEntryStatus.ready;
            const isExternalMedia = entry instanceof KalturaExternalMediaEntry;
            return isReady && isVideoAudio && !isExternalMedia;
        }
        return false;
    }

    public isAvailable(args: ReachAppViewArgs): boolean {
        const isAvailableByConfig = !!serverConfig.externalApps.reach;
        const isAvailableByPermission = this._availableByPermission();
        const isAvailableByData = this._availableByData(args);

        return isAvailableByConfig && isAvailableByData && isAvailableByPermission;
    }
}
