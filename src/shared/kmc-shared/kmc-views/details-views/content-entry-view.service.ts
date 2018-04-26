import { Injectable } from '@angular/core';
import { KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaExternalMediaEntry } from 'kaltura-ngx-client/api/types/KalturaExternalMediaEntry';
import { BaseEntryGetAction } from 'kaltura-ngx-client/api/types/BaseEntryGetAction';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export enum ContentEntryViewSections {
    Metadata = 'Metadata',
    Thumbnails = 'Thumbnails',
    AccessControl = 'AccessControl',
    Scheduling = 'Scheduling',
    Flavours = 'Flavours',
    Captions = 'Captions',
    Live = 'Live',
    Related = 'Related',
    Clips = 'Clips',
    Advertisements = 'Advertisements',
    Users = 'Users',
    Distribution = 'Distribution'
}

export interface ContentEntryViewArgs {
    entry: KalturaMediaEntry;
    section?: ContentEntryViewSections;
    activatedRoute?: ActivatedRoute;
}


@Injectable()
export class ContentEntryViewService extends KmcDetailsViewBaseService<ContentEntryViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _kalturaClient: KalturaClient,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger) {
        super(_logger.subLogger('ContentEntryViewService'), _browserService);
    }

    isAvailable(args: ContentEntryViewArgs): boolean {
        const section = args.section ? args.section : this._getSectionFromActivatedRoute(args.activatedRoute);
        return this._isSectionEnabled(section, args.entry);
    }

    private _isLiveMediaEntry(mediaType: KalturaMediaType): boolean {
        return mediaType === KalturaMediaType.liveStreamFlash ||
            mediaType === KalturaMediaType.liveStreamWindowsMedia ||
            mediaType === KalturaMediaType.liveStreamRealMedia ||
            mediaType === KalturaMediaType.liveStreamQuicktime;
    }

    private _getSectionFromActivatedRoute(activatedRoute: ActivatedRoute): ContentEntryViewSections {
        const sectionToken = activatedRoute.snapshot.firstChild.url[0].path;

        switch (sectionToken) {
            case 'metadata':
                return ContentEntryViewSections.Metadata;
            case 'thumbnails':
                return ContentEntryViewSections.Thumbnails;
            case 'accesscontrol':
                return ContentEntryViewSections.AccessControl;
            case 'scheduling':
                return ContentEntryViewSections.Scheduling;
            case 'flavours':
                return ContentEntryViewSections.Flavours;
            case 'captions':
                return ContentEntryViewSections.Captions;
            case 'live':
                return ContentEntryViewSections.Live;
            case 'related':
                return ContentEntryViewSections.Related;
            case 'clips':
                return ContentEntryViewSections.Clips;
            case 'advertisements':
                return ContentEntryViewSections.Advertisements;
            case 'users':
                return ContentEntryViewSections.Users;
            case 'distribution':
                return ContentEntryViewSections.Distribution;
            default:
                return null;
        }
    }

    private _getSectionRouteToken(section?: ContentEntryViewSections): string {
        switch (section) {
            case ContentEntryViewSections.Thumbnails:
                return 'thumbnails';
            case ContentEntryViewSections.AccessControl:
                return 'accesscontrol';
            case ContentEntryViewSections.Scheduling:
                return 'scheduling';
            case ContentEntryViewSections.Flavours:
                return 'flavours';
            case ContentEntryViewSections.Captions:
                return 'captions';
            case ContentEntryViewSections.Live:
                return 'live';
            case ContentEntryViewSections.Related:
                return 'related';
            case ContentEntryViewSections.Clips:
                return 'clips';
            case ContentEntryViewSections.Advertisements:
                return 'advertisements';
            case ContentEntryViewSections.Users:
                return 'users';
            case ContentEntryViewSections.Distribution:
                return 'distribution';
            case ContentEntryViewSections.Metadata:
            default:
                return 'metadata';
        }
    }

    private _isSectionEnabled(section: ContentEntryViewSections, entry: KalturaMediaEntry): boolean {
        const mediaType = entry.mediaType;
        const externalMedia = entry instanceof KalturaExternalMediaEntry;
        switch (section) {
            case ContentEntryViewSections.Thumbnails:
                return mediaType !== KalturaMediaType.image;
            case ContentEntryViewSections.Flavours:
            case ContentEntryViewSections.Captions:
                return mediaType !== KalturaMediaType.image && !this._isLiveMediaEntry(entry.mediaType) && !externalMedia;
            case ContentEntryViewSections.Advertisements:
                return mediaType !== KalturaMediaType.image && !this._isLiveMediaEntry(entry.mediaType);
            case ContentEntryViewSections.Live:
                return this._isLiveMediaEntry(entry.mediaType);
            case ContentEntryViewSections.Clips:
                return mediaType !== KalturaMediaType.image && !externalMedia;
            case ContentEntryViewSections.Distribution:
                return !this._isLiveMediaEntry(entry.mediaType) && mediaType !== KalturaMediaType.audio && mediaType !== KalturaMediaType.image;
            case ContentEntryViewSections.Metadata:
                return true;
            default:
                return false;
        }
    }

    protected _open(args: ContentEntryViewArgs): Observable<boolean> {
        const sectionToken = this._getSectionRouteToken(args.section);
        return Observable.fromPromise(this._router.navigateByUrl(`/content/entries/entry/${args.entry.id}/${sectionToken}`));
    }

    public openById(entryId: string): Observable<boolean> {
        const baseEntryAction = new BaseEntryGetAction({ entryId })
            .setRequestOptions({
                responseProfile: new KalturaDetachedResponseProfile({
                    type: KalturaResponseProfileType.includeFields,
                    fields: 'id,mediaType'
                })
            });
        return this._kalturaClient.request(baseEntryAction)
            .map(response => {
                if (response instanceof KalturaMediaEntry) {
                    return response;
                } else {
                    throw new Error(`invalid type provided, expected KalturaMediaEntry, got ${typeof response}`);
                }
            })
            .switchMap(entry => this._open({ entry }))
            .catch(err => {
                this._browserService.alert({
                    header: this._appLocalization.get('app.common.error'),
                    message: err.message
                });
                return Observable.of(false);
            });
    }
}
