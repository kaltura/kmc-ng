import {Injectable} from '@angular/core';
import {KMCPermissionsService} from '../../kmc-permissions';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {DetailsViewMetadata, KmcDetailsViewBaseService} from 'app-shared/kmc-shared/kmc-views/kmc-details-view-base.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {KalturaDocumentEntry} from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {Title} from '@angular/platform-browser';
import {ContextualHelpService} from 'app-shared/kmc-shared/contextual-help/contextual-help.service';
import { from as fromPromise} from 'rxjs';
import {ContentEntryViewSections} from "app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service";

export enum ContentDocumentViewSections {
    Metadata = 'Metadata',
    Thumbnails = 'Thumbnails',
    AccessControl = 'AccessControl',
    Scheduling = 'Scheduling',
    Related = 'Related',
    Users = 'Users',
    ResolveFromActivatedRoute = 'ResolveFromActivatedRoute'
}

export interface ContentDocumentViewArgs {
    document: KalturaDocumentEntry;
    section: ContentDocumentViewSections;
    activatedRoute?: ActivatedRoute;
}


@Injectable()
export class ContentDocumentViewService extends KmcDetailsViewBaseService<ContentDocumentViewArgs> {

    private browserService: BrowserService;

    constructor(private _appPermissions: KMCPermissionsService,
                private _appLocalization: AppLocalization,
                private _router: Router,
                _browserService: BrowserService,
                _logger: KalturaLogger,
                _titleService: Title,
                _contextualHelpService: ContextualHelpService) {
        super(_logger.subLogger('ContentDocumentViewService'), _browserService, _titleService, _contextualHelpService);
        this.browserService = _browserService;
    }

    getViewMetadata(args: ContentDocumentViewArgs): DetailsViewMetadata {
        const mainTitle = this._appLocalization.get('app.titles.contentDocumentsPageTitle');
        const documentId = args.document.id;
        const section = args.section === ContentDocumentViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute, args.document) : args.section;
        const sectionTitle = this._appLocalization.get(`applications.content.documents.sections.${section.toLowerCase()}`);
        return {
            title: `${mainTitle} > ${documentId} > ${sectionTitle}`,
            viewKey: `content-document-${section.toLowerCase()}`
        };
    }

    isAvailable(args: ContentDocumentViewArgs): boolean {
        const section = args.section === ContentDocumentViewSections.ResolveFromActivatedRoute ? this._getSectionFromActivatedRoute(args.activatedRoute, args.document) : args.section;
        this._logger.info(`handle isAvailable action by user`, { documentId: args.document.id, section });
        return this._isSectionEnabled(section, args.document);
    }

    private _getSectionFromActivatedRoute(activatedRoute: ActivatedRoute, document: KalturaDocumentEntry): ContentDocumentViewSections {
        let result = null;

        if (activatedRoute) {
            try {
                const sectionToken = activatedRoute.snapshot.firstChild.url[0].path;
                switch (sectionToken) {
                    case 'metadata':
                        result = ContentDocumentViewSections.Metadata;
                        break;
                    case 'thumbnails':
                        result = ContentDocumentViewSections.Thumbnails;
                        break;
                    case 'accesscontrol':
                        result = ContentDocumentViewSections.AccessControl;
                        break;
                    case 'scheduling':
                        result = ContentEntryViewSections.Scheduling;
                        break;
                    case 'related':
                        result = ContentEntryViewSections.Related;
                        break;
                    case 'users':
                        result = ContentDocumentViewSections.Users;
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

    private _getSectionRouteToken(section?: ContentDocumentViewSections): string {
        let result;

        switch (section) {
            case ContentDocumentViewSections.Thumbnails:
                result = 'thumbnails';
                break;
            case ContentDocumentViewSections.AccessControl:
                result = 'accesscontrol';
                break;
            case ContentDocumentViewSections.Scheduling:
                result = 'scheduling';
                break;
            case ContentDocumentViewSections.Related:
                result = 'related';
                break;
            case ContentDocumentViewSections.Users:
                result = 'users';
                break;
            case ContentDocumentViewSections.Metadata:
            default:
                result = 'metadata';
                break;
        }

        this._logger.debug(`section mapped to token`, { section, token: result });

        return result;
    }

    private _isSectionEnabled(section: ContentDocumentViewSections, document: KalturaDocumentEntry): boolean {
        let result = false;
        switch (section) {
            case ContentDocumentViewSections.Metadata:
            case ContentDocumentViewSections.Thumbnails:
            case ContentDocumentViewSections.AccessControl:
            case ContentDocumentViewSections.Scheduling:
            case ContentDocumentViewSections.Related:
            case ContentDocumentViewSections.Users:
                result = true;
                break;
            default:
                break;
        }

        this._logger.debug(`availability result`, { result });

        return result;
    }

    protected _open(args: ContentDocumentViewArgs): Observable<boolean> {
        this._logger.info('handle open document view request by the user', { documentId: args.document.id });
        const sectionToken = this._getSectionRouteToken(args.section);
        return fromPromise(this._router.navigateByUrl(`/content/documents/document/${args.document.id}/${sectionToken}`));
    }
}
