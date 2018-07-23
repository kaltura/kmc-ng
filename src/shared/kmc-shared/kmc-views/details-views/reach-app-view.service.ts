import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserService } from 'shared/kmc-shell/providers/browser.service';
import { KalturaCategory, KalturaEntryStatus, KalturaExternalMediaEntry, KalturaMediaEntry, KalturaMediaType } from 'kaltura-ngx-client';
import { serverConfig } from 'config/server';
import { KMCPermissions, KMCPermissionsService } from 'shared/kmc-shared/kmc-permissions/index';
import { DetailsViewMetadata, KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';
import { Title } from '@angular/platform-browser';
import { AppEventsService } from 'app-shared/kmc-shared/app-events';
import { CaptionRequestEvent } from 'app-shared/kmc-shared/events';
import { Observable, of as ObservableOf } from 'rxjs';

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
export class ReachAppViewService extends KmcDetailsViewBaseService<ReachAppViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                private _appEvents: AppEventsService,
                _browserService: BrowserService,
                _logger: KalturaLogger,
                _titleService: Title,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('ReachAppViewService'), _browserService,
            _titleService, _contextualHelpService);
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

    protected _open(args: ReachAppViewArgs): Observable<boolean> {
        this._logger.info('handle open view request by the user', { page: args.page });
        const page = args.page;
        delete args.page;
        this._appEvents.publish(new CaptionRequestEvent(args, page));
        return ObservableOf(true);
    }

    public isAvailable(args: ReachAppViewArgs): boolean {
        const isAvailableByConfig = !!serverConfig.externalApps.reach;
        const isAvailableByPermission = this._availableByPermission();
        const isAvailableByData = this._availableByData(args);

        return isAvailableByConfig && isAvailableByData && isAvailableByPermission;
    }

    public getViewMetadata(args: ReachAppViewArgs): DetailsViewMetadata {
        return { title: '', viewKey: '' };
    }
}
