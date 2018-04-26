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
    reloadEntriesListOnNavigateOut?: boolean;
}


@Injectable()
export class ContentEntryViewService extends KmcDetailsViewBaseService<ContentEntryViewArgs> {
    public reloadEntriesListOnNavigateOut: boolean;

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
        this._logger.info(`handle isAvailable action by user`, { categoryId: args.entry.id, section });
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
        let result = null;

        switch (sectionToken) {
            case 'metadata':
                result = ContentEntryViewSections.Metadata;
                break;
            case 'thumbnails':
                result = ContentEntryViewSections.Thumbnails;
                break;
            case 'accesscontrol':
                result = ContentEntryViewSections.AccessControl;
                break;
            case 'scheduling':
                result = ContentEntryViewSections.Scheduling;
                break;
            case 'flavours':
                result = ContentEntryViewSections.Flavours;
                break;
            case 'captions':
                result = ContentEntryViewSections.Captions;
                break;
            case 'live':
                result = ContentEntryViewSections.Live;
                break;
            case 'related':
                result = ContentEntryViewSections.Related;
                break;
            case 'clips':
                result = ContentEntryViewSections.Clips;
                break;
            case 'advertisements':
                result = ContentEntryViewSections.Advertisements;
                break;
            case 'users':
                result = ContentEntryViewSections.Users;
                break;
            case 'distribution':
                result = ContentEntryViewSections.Distribution;
                break;
            default:
                break;
        }

        this._logger.debug(`sectionToken mapped to section`, { section: result, sectionToken });

        return result;
    }

    private _getSectionRouteToken(section?: ContentEntryViewSections): string {
        let result;
        switch (section) {
            case ContentEntryViewSections.Thumbnails:
                result = 'thumbnails';
                break;
            case ContentEntryViewSections.AccessControl:
                result = 'accesscontrol';
                break;
            case ContentEntryViewSections.Scheduling:
                result = 'scheduling';
                break;
            case ContentEntryViewSections.Flavours:
                result = 'flavours';
                break;
            case ContentEntryViewSections.Captions:
                result = 'captions';
                break;
            case ContentEntryViewSections.Live:
                result = 'live';
                break;
            case ContentEntryViewSections.Related:
                result = 'related';
                break;
            case ContentEntryViewSections.Clips:
                result = 'clips';
                break;
            case ContentEntryViewSections.Advertisements:
                result = 'advertisements';
                break;
            case ContentEntryViewSections.Users:
                result = 'users';
                break;
            case ContentEntryViewSections.Distribution:
                result = 'distribution';
                break;
            case ContentEntryViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        this._logger.debug(`section mapped to token`, { section, token: result });

        return result;
    }

    private _isSectionEnabled(section: ContentEntryViewSections, entry: KalturaMediaEntry): boolean {
        this._logger.debug(`check section availability for entry`, { categoryId: entry.id, section });
        const mediaType = entry.mediaType;
        const externalMedia = entry instanceof KalturaExternalMediaEntry;
        let result = false;
        switch (section) {
            case ContentEntryViewSections.Thumbnails:
                result = mediaType !== KalturaMediaType.image;
                break;
            case ContentEntryViewSections.Flavours:
            case ContentEntryViewSections.Captions:
                result = mediaType !== KalturaMediaType.image && !this._isLiveMediaEntry(entry.mediaType) && !externalMedia;
                break;
            case ContentEntryViewSections.Advertisements:
                result = mediaType !== KalturaMediaType.image && !this._isLiveMediaEntry(entry.mediaType);
                break;
            case ContentEntryViewSections.Live:
                result = this._isLiveMediaEntry(entry.mediaType);
                break;
            case ContentEntryViewSections.Clips:
                result = mediaType !== KalturaMediaType.image && !externalMedia;
                break;
            case ContentEntryViewSections.Distribution:
                result = !this._isLiveMediaEntry(entry.mediaType) && mediaType !== KalturaMediaType.audio && mediaType !== KalturaMediaType.image;
                break;
            case ContentEntryViewSections.Metadata:
                result = true;
                break;
            default:
                break;
        }

        this._logger.debug(`availability result`, { result });

        return result;
    }

    protected _open(args: ContentEntryViewArgs): Observable<boolean> {
        const sectionToken = this._getSectionRouteToken(args.section);
        this._logger.info('handle open entry view request by the user', { entryId: args.entry.id, sectionToken });
        return Observable.fromPromise(
            this._router.navigateByUrl(
                `/content/entries/entry/${args.entry.id}/${sectionToken}`,
                { queryParams: { reloadEntriesListOnNavigateOut: args.reloadEntriesListOnNavigateOut } }
            )
        );
    }

    public openById(entryId: string, reloadEntriesListOnNavigateOut?: boolean): Observable<boolean> {
        this._logger.info('handle open entry view by id request by the user, load entry data', { entryId });
        const baseEntryAction = new BaseEntryGetAction({ entryId })
            .setRequestOptions({
                responseProfile: new KalturaDetachedResponseProfile({
                    type: KalturaResponseProfileType.includeFields,
                    fields: 'id,mediaType'
                })
            });
        return this._kalturaClient.request(baseEntryAction)
            .map(response => {
                console.warn(response);
                if (response instanceof KalturaMediaEntry) {
                    return response;
                } else {
                    throw new Error(`invalid type provided, expected KalturaMediaEntry, got ${typeof response}`);
                }
            })
            .switchMap(entry => {
                this._logger.info(`handle successful request, proceed navigation`);
                return this._open({ entry, section: ContentEntryViewSections.Metadata, reloadEntriesListOnNavigateOut });
            })
            .catch(err => {
                this._logger.info(`handle failed request, show alert, abort navigation`);
                this._browserService.alert({
                    header: this._appLocalization.get('app.common.error'),
                    message: err.message
                });
                return Observable.of(false);
            });
    }
}
