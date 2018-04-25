import { Injectable } from '@angular/core';
import { KMCPermissionsService } from '../../kmc-permissions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KmcDetailsViewBaseService } from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';

export enum ContentPlaylistViewSections {
    Metadata = 'Metadata',
    Content = 'Content',
    ContentRuleBased = 'ContentRuleBased'
}

export interface ContentPlaylistViewArgs {
    playlist: KalturaPlaylist;
    section?: ContentPlaylistViewSections;
}


@Injectable()
export class ContentPlaylistViewService extends KmcDetailsViewBaseService<ContentPlaylistViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private router: Router) {
        super();
    }

    isAvailable(args: ContentPlaylistViewArgs): boolean {
        return this._isSectionEnabled(args.section, args.playlist);
    }

    private _getSectionRouteToken(section?: ContentPlaylistViewSections): string {
        let result;

        switch (section) {
            case ContentPlaylistViewSections.Content:
            case ContentPlaylistViewSections.ContentRuleBased:
                result = 'content';
                break;
            case ContentPlaylistViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        return result;
    }

    private _isSectionEnabled(section: ContentPlaylistViewSections, playlist: KalturaPlaylist): boolean {
        switch (section) {
            case ContentPlaylistViewSections.Content:
                return playlist.playlistType === KalturaPlaylistType.staticList;
            case ContentPlaylistViewSections.ContentRuleBased:
                return playlist.playlistType === KalturaPlaylistType.dynamic;
            case ContentPlaylistViewSections.Metadata:
                return true;
            default:
                return false;
        }
    }

    protected _open(args: ContentPlaylistViewArgs): Observable<boolean> {
        const sectionToken = this._getSectionRouteToken(args.section);
        return Observable.fromPromise(this.router.navigateByUrl(`/content/playlists/playlist/${args.playlist.id}/${sectionToken}`));
    }
}
