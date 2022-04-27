import { Injectable } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppAuthentication } from "../auth/app-authentication.service";

export enum EventType
{
    ButtonClicked = 10002,
    PageLoad = 10003
}

export enum ApplicationType
{
    KMC = 0,
    Analytics = 13
}

export enum PageType
{
    View = 1,
    Create = 2,
    Edit = 3,
    Participate = 4,
    List = 5,
    Analytics = 6,
    Admin = 7,
    Error = 8,
    Login = 9,
    Registration = 10,
    Custom = 11,
}

export enum ButtonType
{
    Create = 1,
    Filter = 2,
    Search = 3,
    Export = 4,
    Navigate = 5,
    Schedule = 6,
    Insert = 7,
    Choose = 8,
    Launch = 9,
    Open = 10,
    Send = 11,
    Invite = 12,
    Close = 13,
    Save = 14,
    Expand = 15,
    Collapse = 16,
    Edit = 17,
    Delete = 18,
    Browse = 19,
    Load = 20,
    Add = 21,
}

@Injectable()
export class AppAnalytics {

    private _logger: KalturaLogger;
    private _enabled = false;

    constructor(private kalturaServerClient: KalturaClient,
                private _appAuthentication: AppAuthentication,
                logger: KalturaLogger,
                private router: Router) {
        this._logger = logger.subLogger('AppAnalytics');
    }

    public init(): void {
        this._logger.info('init app analytics');
        this._enabled = true; // TODO check for Analytics URI
        if (this._enabled) {
            this.registerPageLoadEvents();
        }
    }

    private registerPageLoadEvents(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event) => {
                switch ((event as NavigationEnd).urlAfterRedirects) {
                    case '/login':
                        this.trackEvent(EventType.PageLoad, PageType.Login, 'KMC_login_page');
                        break;
                    case '/content/entries/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_entries_list');
                        break;
                    case '/content/moderation/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_moderation_list');
                        break;
                    case '/content/playlists/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_playlist_list');
                        break;
                    case '/content/syndication/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_syndication_list');
                        break;
                    case '/content/categories/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_categories_list');
                        break;
                    case '/administration/users/list':
                        this.trackEvent(EventType.PageLoad, PageType.Admin, 'Administration_users');
                        break;
                    case '/administration/roles/list':
                        this.trackEvent(EventType.PageLoad, PageType.Admin, 'Administration_roles');
                        break;
                }
            });
    }

    public trackClickEvent(buttonName: string): void {
        let buttonType: ButtonType;
        switch (buttonName) {
            case 'Create':
            case 'Generate_SIP_user':
            case 'Generate_passphrase_encryption':
                buttonType = ButtonType.Create;
                break;
            case 'Change_account':
            case 'Bulk_actions':
                buttonType = ButtonType.Choose;
                break;
            case 'Change_log':
                buttonType = ButtonType.Browse;
                break;
            case 'KMC_overview':
            case 'Login':
            case 'Login_with_SSO':
            case 'Sign_up':
                buttonType = ButtonType.Navigate;
                break;
            case 'Refine':
            case 'Filter_categories':
                buttonType = ButtonType.Filter;
                break;
            case 'Search_entries':
                buttonType = ButtonType.Search;
                break;
            case 'Add_playlist':
            case 'Add_category':
            case 'Add_user':
            case 'Add_role':
            case 'Captions_enrich':
                buttonType = ButtonType.Add;
                break;
            case 'View_analytics':
            case 'Real-time_analytics':
            case 'Webcast_analytics':
                buttonType = ButtonType.Open;
                break;
            case 'Share_Embed':
                buttonType = ButtonType.Launch;
                break;
            case 'Delete':
            case 'Bulk_delete':
                buttonType = ButtonType.Delete;
                break;
        }
        if (buttonType) {
            this.trackEvent(EventType.ButtonClicked, buttonType, buttonName);
        }
    }

    private trackEvent(eventType: EventType, EventVar1: ButtonType | PageType, EventVar2: string): void {
        if (!this._enabled) {
            return;
        }
        const ks = this._appAuthentication.appUser ? this._appAuthentication.appUser.ks : null;
        const pid = this._appAuthentication.appUser ? this._appAuthentication.appUser.partnerId.toString() :  null;
        // check for entry ID in URL
        const urlParts = this.router.url.split('/');
        const entryIndex = urlParts.indexOf('entry') + 1;
        const entryId =  entryIndex > 0 && urlParts.length >= entryIndex ? urlParts[entryIndex] : null;

        if (eventType === EventType.PageLoad) {
            console.log("----> trackEvent: eventType: " + eventType + ", pageType: " + EventVar1 + ", pageName: " + EventVar2);
        } else {
            console.log("----> trackEvent: eventType: " + eventType + ", buttonType: " + EventVar1 + ", buttonName: " + EventVar2);
        }
    }
}
