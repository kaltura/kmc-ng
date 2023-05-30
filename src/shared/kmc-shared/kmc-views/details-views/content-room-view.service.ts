import {Injectable} from '@angular/core';
import {KMCPermissionsService} from '../../kmc-permissions';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {DetailsViewMetadata, KmcDetailsViewBaseService} from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaRoomEntry} from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {Title} from '@angular/platform-browser';
import {ContextualHelpService} from 'app-shared/kmc-shared/contextual-help/contextual-help.service';
import { from as fromPromise} from 'rxjs';

export enum ContentRoomViewSections {
    Metadata = 'Metadata',
    Thumbnails = 'Thumbnails',
    AccessControl = 'AccessControl',
    Recordings = 'Recordings',
    Breakout = 'Breakout',
    Users = 'Users',
    ResolveFromActivatedRoute = 'ResolveFromActivatedRoute'
}

export interface ContentRoomViewArgs {
    room: KalturaRoomEntry;
    section: ContentRoomViewSections;
    activatedRoute?: ActivatedRoute;
}


@Injectable()
export class ContentRoomViewService extends KmcDetailsViewBaseService<ContentRoomViewArgs> {

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger,
                _titleService: Title,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('ContentRoomViewService'), _browserService, _titleService, _contextualHelpService);
    }

    getViewMetadata(args: ContentRoomViewArgs): DetailsViewMetadata {
        const mainTitle = this._appLocalization.get('app.titles.contentRoomsPageTitle');
        const roomId = args.room.id;
        const section = args.section === ContentRoomViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute, args.room) : args.section;
        const sectionTitle = this._appLocalization.get(`applications.content.rooms.sections.${section.toLowerCase()}`);
        return {
            title: `${mainTitle} > ${roomId} > ${sectionTitle}`,
            viewKey: `content-room-${section.toLowerCase()}`
        };
    }

    isAvailable(args: ContentRoomViewArgs): boolean {
        const section = args.section === ContentRoomViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute, args.room) : args.section;
        this._logger.info(`handle isAvailable action by user`, { roomId: args.room.id, section });
        return this._isSectionEnabled(section, args.room);
    }

    private _getSectionFromActivatedRoute(activatedRoute: ActivatedRoute, room: KalturaRoomEntry): ContentRoomViewSections {
        let result = null;

        if (activatedRoute) {
            try {
                const sectionToken = activatedRoute.snapshot.firstChild.url[0].path;
                switch (sectionToken) {
                    case 'metadata':
                        result = ContentRoomViewSections.Metadata;
                        break;
                    case 'thumbnails':
                        result = ContentRoomViewSections.Thumbnails;
                        break;
                    case 'accesscontrol':
                        result = ContentRoomViewSections.AccessControl;
                        break;
                    case 'recordings':
                        result = ContentRoomViewSections.Recordings;
                        break;
                    case 'breakout':
                        result = ContentRoomViewSections.Breakout;
                        break;
                    case 'users':
                        result = ContentRoomViewSections.Users;
                        break;
                    default:
                        break;
                }

                this._logger.debug(`sectionToken mapped to section`, { section: result, sectionToken });
            } catch (e) {
                this._logger.error(`failed to resolve section from activated route`);
            }
        }

        return result;
    }

    private _getSectionRouteToken(section?: ContentRoomViewSections): string {
        let result;

        switch (section) {
            case ContentRoomViewSections.Thumbnails:
                result = 'thumbnails';
                break;
            case ContentRoomViewSections.AccessControl:
                result = 'accesscontrol';
                break;
            case ContentRoomViewSections.Recordings:
                result = 'recordings';
                break;
            case ContentRoomViewSections.Breakout:
                result = 'breakout';
                break;
            case ContentRoomViewSections.Users:
                result = 'users';
                break;
            case ContentRoomViewSections.Metadata:
            default:
                result = 'metadata';
                break;

        }

        this._logger.debug(`section mapped to token`, { section, token: result });

        return result;
    }

    private _isSectionEnabled(section: ContentRoomViewSections, room: KalturaRoomEntry): boolean {
        let result = false;
        switch (section) {
            case ContentRoomViewSections.Metadata:
            case ContentRoomViewSections.Thumbnails:
            case ContentRoomViewSections.AccessControl:
            case ContentRoomViewSections.Recordings:
            case ContentRoomViewSections.Breakout:
            case ContentRoomViewSections.Users:
                result = true;
                break;
            default:
                break;
        }

        this._logger.debug(`availability result`, { result });

        return result;
    }

    protected _open(args: ContentRoomViewArgs): Observable<boolean> {
        this._logger.info('handle open room view request by the user', { roomId: args.room.id });
        const sectionToken = this._getSectionRouteToken(args.section);
        return fromPromise(this._router.navigateByUrl(`/content/rooms/room/${args.room.id}/${sectionToken}`));
    }
}
